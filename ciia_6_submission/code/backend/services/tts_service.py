"""
MedGuard AI - Vernacular Text-to-Speech (TTS) Service
=====================================================
Generates localized audio alerts in Marathi (mr), Hindi (hi), and English (en)
for elderly and low-literacy patients.
"""

import io
import base64
from typing import Dict, Any

try:
    from gtts import gTTS
    GTTS_AVAILABLE = True
except ImportError:
    GTTS_AVAILABLE = False


# Pre-recorded vernacular translations for common clinical warnings
VERNACULAR_TRANSLATIONS = {
    "warfarin_bleeding_warning": {
        "en": "Warning: Do not take Combiflam with Warfarin. It can cause serious internal bleeding. Please consult your doctor.",
        "mr": "सावधान: वॉरफेरिन सोबत कॉम्बीफ्लॅम घेऊ नका. यामुळे अंतर्गत रक्तस्त्रावाचा मोठा धोका होऊ शकतो. त्वरित डॉक्टरांचा सल्ला घ्या.",
        "hi": "चेतावनी: वॉर्फरिन के साथ कॉम्बिफ्लैम न लें। इससे गंभीर आंतरिक रक्तस्राव हो सकता है। कृपया तुरंत डॉक्टर से संपर्क करें।"
    },
    "missed_dose_warning": {
        "en": "Alert: You have missed your dose of Warfarin 5mg. This is a critical blood thinner. Caregiver has been notified.",
        "mr": "सूचना: तुम्ही तुमची वॉरफेरिन ५ मि.ग्रॅ. ची मात्रा चुकवली आहे. हे अतिशय महत्त्वाचे औषध आहे. काळजीवाहू व्यक्तीला माहिती दिली आहे.",
        "hi": "सूचना: आपने अपनी वॉर्फरिन ५ मि.ग्रा. की खुराक छोड़ दी है। यह एक अत्यंत आवश्यक दवा है। देखभालकर्ता को सूचित कर दिया गया है।"
    }
}


def generate_audio_base64(text: str, lang: str = "mr") -> Dict[str, Any]:
    """Generates audio bytes encoded as Base64 string for direct playback."""
    if GTTS_AVAILABLE:
        try:
            tts = gTTS(text=text, lang=lang, slow=False)
            mp3_fp = io.BytesIO()
            tts.write_to_fp(mp3_fp)
            mp3_fp.seek(0)
            b64_audio = base64.b64encode(mp3_fp.read()).decode("utf-8")
            return {
                "success": True,
                "audio_base64": f"data:audio/mp3;base64,{b64_audio}",
                "lang": lang,
                "text": text
            }
        except Exception as e:
            return {"success": False, "error": str(e), "text": text, "lang": lang}

    return {
        "success": False,
        "error": "gTTS library not installed on server; use browser Web Speech API fallback.",
        "text": text,
        "lang": lang
    }
