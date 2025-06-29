import requests

def test_detect_dosha():
    url = "http://127.0.0.1:8000/api/detect-dosha"

    quiz_answers = [
        "Large, solid build, gains weight easily",
        "Slow to start but lasts long — steady energy",
        "Slow digestion, often feels heavy after meals",
        "Soft, smooth, moist and cool",
        "Irritated or angry",
        "Sleeps soundly but not for long",
        "Cool and dry weather",
        "Focused, confident, likes leading",
        "I like discipline and order"
    ]

    response = requests.post(url, json={"answers": quiz_answers})
    assert response.status_code == 200
    dosha = response.json().get("dosha")

    # ✅ Add this line to print it
    print(f"\n🧠 Detected Dosha: {dosha}")

    assert dosha in [
        "vata", "pitta", "kapha",
        "vata-pitta", "pitta-kapha", "vata-kapha", "tridoshic"
    ]