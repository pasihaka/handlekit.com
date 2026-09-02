import os

# Default Amazon tracking tag (can be overridden via environment variable)
AMAZON_TAG = os.environ.get("AMAZON_AFFILIATE_TAG", "handlekit-20")

AFFILIATE_CATALOG = {
    "tinnitus": [
        {
            "id": "sleepphones",
            "title": "AcousticSheep SleepPhones v8",
            "badge": "Nighttime Masking",
            "tagline": "Ultra-thin, flat headband speakers designed specifically for side-sleepers listening to tinnitus sound therapy.",
            "icon": "headphones",
            "cta": "View SleepPhones",
            "url": f"https://www.amazon.com/dp/B0046RE5Z6?tag={AMAZON_TAG}",
            "highlights": ["Zero ear pressure on pillows", "Soft breathable fleece headband", "Corded or Bluetooth options"]
        },
        {
            "id": "loop_quiet",
            "title": "Loop Quiet 2 Earplugs",
            "badge": "Certified Noise Reduction",
            "tagline": "Flexible, reusable silicone earplugs with 24 dB SNR noise reduction for sleep, focus, and hyperacusis sensitivity.",
            "icon": "shield-check",
            "cta": "View Loop Quiet",
            "url": f"https://www.amazon.com/dp/B0D1CYG2V7?tag={AMAZON_TAG}",
            "highlights": ["Ultra-comfortable fit", "Easy to wash & reuse", "Includes 4 ear tip sizes"]
        },
        {
            "id": "lectrofan",
            "title": "LectroFan High-Fidelity Sound Machine",
            "badge": "Physical White & Pink Noise",
            "tagline": "Generates 20 non-looping digital sound profiles (pink, white, and brown noise) to naturally mask ringing frequencies.",
            "icon": "radio",
            "cta": "View on Amazon",
            "url": f"https://www.amazon.com/dp/B00E6D6LQY?tag={AMAZON_TAG}",
            "highlights": ["Non-repeating natural audio", "Precise volume stepping", "Compact bedside footprint"]
        }
    ],
    "hearing_age": [
        {
            "id": "loop_experience",
            "title": "Loop Experience 2 Earplugs",
            "badge": "Hearing Preservation",
            "tagline": "Acoustic-channel earplugs that lower volume by 17 dB without muffling music, protecting fragile high-frequency hair cells.",
            "icon": "headphones",
            "cta": "View Loop Experience",
            "url": f"https://www.amazon.com/dp/B0D1CW6XKM?tag={AMAZON_TAG}",
            "highlights": ["Preserves sound fidelity", "Certified hearing protection", "Ideal for concerts & clubs"]
        },
        {
            "id": "ath_m50x",
            "title": "Audio-Technica ATH-M50x",
            "badge": "Extended Acoustic Range",
            "tagline": "Professional studio monitor headphones with a wide 15 Hz to 28,000 Hz frequency response for true high-frequency listening.",
            "icon": "sliders",
            "cta": "View on Amazon",
            "url": f"https://www.amazon.com/dp/B00HVLUR86?tag={AMAZON_TAG}",
            "highlights": ["True 15 Hz – 28 kHz range", "45mm large-aperture drivers", "Superior passive noise isolation"]
        },
        {
            "id": "lexie_hearing",
            "title": "Lexie B2 Plus OTC Hearing Aids",
            "badge": "FDA-Cleared OTC Solution",
            "tagline": "Self-fitting over-the-counter hearing aids powered by Bose audio technology, tailored for mild-to-moderate high-frequency loss.",
            "icon": "activity",
            "cta": "View Lexie Hearing",
            "url": f"https://www.amazon.com/dp/B0CKR4S4Z1?tag={AMAZON_TAG}",
            "highlights": ["Bose acoustic engineering", "Self-tuned via smartphone app", "Discreet receiver-in-canal fit"]
        }
    ],
    "contrast_vision": [
        {
            "id": "benq_screenbar",
            "title": "BenQ ScreenBar Monitor Light Bar",
            "badge": "Contrast & Glare Reduction",
            "tagline": "Asymmetrical optical LED lamp that mounts to your monitor, illuminating your desk with zero screen glare to maximize visual contrast.",
            "icon": "sun",
            "cta": "View ScreenBar",
            "url": f"https://www.amazon.com/dp/B077976ZNV?tag={AMAZON_TAG}",
            "highlights": ["Zero monitor reflection", "Auto-dimming ambient sensor", "Adjustable color temperature"]
        },
        {
            "id": "prospek_glasses",
            "title": "PROSPEK Blue Light Ergonomics Glasses",
            "badge": "Screen Strain Prevention",
            "tagline": "Multi-layer anti-reflective lenses that block high-energy blue light and glare, reducing the eye strain that degrades contrast perception.",
            "icon": "glasses",
            "cta": "View Glasses",
            "url": f"https://www.amazon.com/dp/B00V5BCN6K?tag={AMAZON_TAG}",
            "highlights": ["Anti-reflective coating", "Certified blue light filter", "Ultra-lightweight frame"]
        },
        {
            "id": "manta_mask",
            "title": "Manta Heated Eye Mask",
            "badge": "Tear Film & Dry Eye Therapy",
            "tagline": "Microwave-heated thermal compress that unblocks eyelid glands, stabilizing tear film for crisp, sharp contrast clarity.",
            "icon": "eye",
            "cta": "View Manta Mask",
            "url": f"https://www.amazon.com/dp/B09D8Q19MC?tag={AMAZON_TAG}",
            "highlights": ["Deep soothing heat therapy", "Zero eye pressure contouring", "Promotes natural eye moisture"]
        }
    ]
}

def get_recommendations(category):
    return AFFILIATE_CATALOG.get(category, [])
