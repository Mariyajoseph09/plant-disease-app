# Plant Disease Classifier

Upload a leaf photo and get the predicted disease with a confidence score.

![Screenshot](screenshot.png)

## Model
- MobileNetV2 (transfer learning, PyTorch), 7 classes: apple (scab, black rot, healthy), cherry (powdery mildew, healthy), corn (common rust, northern leaf blight)
- Dataset: PlantVillage
- Validation accuracy: 98.8%. Weakest class: Apple scab (93.5% recall)

## Stack
PyTorch, FastAPI, React (Vite)

## Run locally
Backend:
```
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```
Frontend:
```
cd frontend
npm install
npm run dev
```

## Limitations
- PlantVillage images are lab-style (single leaf, plain background), so accuracy on real field photos is lower. An outdoor photo of an unsupported leaf was still classified as Apple scab with 77.7% confidence.
- The model only knows 7 classes and always picks one of them. The app shows a low-confidence warning below 85%.git 