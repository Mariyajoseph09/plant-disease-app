import io
import json

import torch
import torch.nn as nn
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from torchvision import models, transforms

app = FastAPI(title="Plant Disease Classifier")

# Allow the React app to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load class names and model once, when the server starts
with open("class_names.json") as f:
    class_names = json.load(f)

model = models.mobilenet_v2(weights=None)
model.classifier[1] = nn.Linear(model.last_channel, len(class_names))
model.load_state_dict(torch.load("plant_model.pth", map_location="cpu"))
model.eval()

# Must match the validation preprocessing used in training
preprocess = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])


@app.get("/")
def home():
    return {"status": "ok"}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Please upload an image file.")

    try:
        image = Image.open(io.BytesIO(await file.read())).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Could not read the image.")

    tensor = preprocess(image).unsqueeze(0)
    with torch.no_grad():
        probs = torch.softmax(model(tensor), dim=1)[0]

    top3 = torch.topk(probs, 3)
    return {
        "prediction": class_names[top3.indices[0]],
        "confidence": round(top3.values[0].item() * 100, 1),
        "top3": [
            {"label": class_names[i], "confidence": round(p.item() * 100, 1)}
            for p, i in zip(top3.values, top3.indices)
        ],
    }