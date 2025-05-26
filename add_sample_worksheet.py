import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
import datetime # Required for a default date if serverTimestamp is tricky locally

# --- Configuration ---
# Updated with the user-provided path
PATH_TO_FIREBASE_ADMIN_SDK_JSON = "C:/Users/Dan Mill/Downloads/mgscompscihub2PK.json"

# --- Sample Worksheet Data ---
# This structure is based on our discussion for Phase 3 & IV.
# We'll use double quotes for all strings as requested.
SAMPLE_WORKSHEET_DATA = {
    "title": "Digital Images and Representation",
    "course": "J277 OCR GCSE CS",
    "unit": "1.2 Data Representation",
    "specReference": "1.2.4 Images",
    "learningObjectives": [
        "Explain how bitmap images are represented in binary (pixels, colour depth, resolution).",
        "Calculate bitmap image file sizes in bits and bytes.",
        "Understand the impact of colour depth and resolution on image quality and file size."
    ],
    "keywords": ["Bitmap", "Pixel", "Colour Depth", "Resolution", "Metadata", "File Size", "Binary"],
    "sections": [
        {
            "id": "starter-activity",
            "title": "Starter Activity (Think & Discuss - 5 mins)",
            "type": "Questionnaire", # A group of questions
            "questions": [
                {
                    "id": "starter-q1",
                    "type": "ShortAnswer", # Component: <ShortAnswerQuestion />
                    "prompt": "If you zoom in very, very close on a digital photograph on your screen, what do you eventually see?",
                    "placeholder": "Your answer here..."
                },
                {
                    "id": "starter-q2",
                    "type": "ShortAnswer",
                    "prompt": "What do you think 'resolution' means when talking about digital images?",
                    "placeholder": "Your thoughts..."
                }
            ]
        },
        {
            "id": "lesson-outcomes-display", # Changed ID slightly to avoid conflict if objectives are also a section
            "title": "Today's Lesson Outcomes",
            "type": "StaticContent", # Component: <StaticContentBlock />
            # Using the learningObjectives array from above for content here
            "htmlContent": "<ul>" + "".join([f"<li>{obj}</li>" for obj in [
                "Explain how bitmap images are represented in binary (pixels, colour depth, resolution).",
                "Calculate bitmap image file sizes in bits and bytes.",
                "Understand the impact of colour depth and resolution on image quality and file size."
            ]]) + "</ul>"
        },
        {
            "id": "how-images-stored",
            "title": "How Digital Images are Stored (Bitmap/Raster)",
            "type": "StaticContent",
            "htmlContent": """
                <p>Digital images, especially photographs and complex graphics, are often stored as <strong>bitmap</strong> images (also known as <strong>raster</strong> images). A bitmap image is essentially a grid of tiny squares called <strong>pixels</strong> (short for 'picture elements').</p>
                <p>Each pixel in the grid is assigned a specific colour. The computer stores this colour information as a binary number. The more pixels an image has, the higher its <strong>resolution</strong>, and generally, the more detail it can display.</p>
                <p>Think of it like a mosaic, where each tile is a pixel, and together they form a complete picture.</p>
                """
        },
        {
            "id": "colour-depth-info",
            "title": "Colour Depth",
            "type": "StaticContent",
            "htmlContent": """
                <p><strong>Colour depth</strong> (or bit depth) refers to the number of bits used to represent the colour of a single pixel. The more bits used per pixel, the more distinct colours can be represented:</p>
                <ul>
                    <li><strong>1-bit colour:</strong> 2 colours (e.g., black and white). Each pixel is either 0 or 1.</li>
                    <li><strong>8-bit colour:</strong> 2<sup>8</sup> = 256 colours. Common for GIFs and simpler graphics.</li>
                    <li><strong>24-bit colour (True Colour):</strong> 2<sup>24</sup> = 16,777,216 colours. Often uses 8 bits for Red, 8 for Green, and 8 for Blue (RGB). This allows for photorealistic images.</li>
                </ul>
                <p>Higher colour depth means more realistic colours but also increases the image file size because more data is needed for each pixel.</p>
            """
        },
        {
            "id": "resolution-info",
            "title": "Resolution",
            "type": "StaticContent",
            "htmlContent": """
                <p><strong>Resolution</strong> refers to the number of pixels in an image, typically expressed as width x height (e.g., 1920x1080 pixels) or as PPI (Pixels Per Inch).</p>
                <ul>
                    <li><strong>Higher resolution</strong> means more pixels, resulting in a sharper, more detailed image. However, it also means a larger file size.</li>
                    <li><strong>Lower resolution</strong> means fewer pixels, which can make the image appear blurry or "pixelated" if enlarged too much. File sizes are smaller.</li>
                </ul>
                <p>The appropriate resolution depends on the intended use of the image (e.g., web display, print).</p>
            """
        },
        {
            "id": "file-size-calculation",
            "title": "Calculating Image File Size (Bitmap)",
            "type": "Questionnaire",
            "questions": [
                 {
                    "id": "filesize-explainer",
                    "type": "StaticContent", # Can embed static content within a questionnaire section
                    "htmlContent": """
                        <p>The basic file size of an uncompressed bitmap image can be calculated using the formula:</p>
                        <p><strong>File Size (in bits) = Image Width (pixels) &times; Image Height (pixels) &times; Colour Depth (bits per pixel)</strong></p>
                        <p>To convert to bytes, divide the result by 8 (since 1 byte = 8 bits).</p>
                        <p><em>Note: This doesn't include metadata (like camera settings, date taken), which adds a small amount to the total file size. Compression techniques (like JPEG, PNG) also significantly alter file sizes.</em></p>
                    """
                },
                {
                    "id": "calc-q1",
                    "type": "ShortAnswer",
                    "prompt": "An image is 100 pixels wide and 80 pixels high. It uses a colour depth of 1 bit per pixel. What is its file size in bits?",
                    "placeholder": "Calculation and answer in bits"
                },
                {
                    "id": "calc-q2",
                    "type": "ShortAnswer",
                    "prompt": "Convert the file size from the previous question into bytes.",
                    "placeholder": "Answer in bytes"
                },
                {
                    "id": "calc-q3",
                    "type": "ShortAnswer",
                    "prompt": "A 'True Colour' (24-bit colour depth) image has a resolution of 800x600 pixels. Calculate its uncompressed file size in bits and then in kilobytes (KB). (1 KB = 1024 Bytes)",
                    "placeholder": "Show working for bits and KB"
                }
            ]
        }
    ],
    "createdAt": datetime.datetime.now(datetime.timezone.utc) # UTC timestamp
}

def add_worksheet_to_firestore(db_client, worksheet_data):
    """
    Adds or overwrites a worksheet in the 'worksheets' collection.
    Uses the worksheet title to generate a document ID for consistency if run multiple times.
    """
    doc_id = worksheet_data["title"].lower().replace(" ", "-").replace("&", "and")

    try:
        worksheet_ref = db_client.collection("worksheets").document(doc_id)
        worksheet_ref.set(worksheet_data)
        print(f"Successfully added/updated worksheet with ID: {doc_id}")
        return doc_id
    except Exception as e:
        print(f"Error adding worksheet {doc_id}: {e}")
        return None

def main():
    """
    Initializes Firebase Admin SDK and adds the sample worksheet.
    """
    # The check for the placeholder path has been removed as the user provided the correct path.
    try:
        cred = credentials.Certificate(PATH_TO_FIREBASE_ADMIN_SDK_JSON)
        # Check if the default app is already initialized
        if not firebase_admin._apps:
            firebase_admin.initialize_app(cred)
            print("Firebase Admin SDK initialized successfully.")
        else:
            print("Firebase Admin SDK already initialized.")
        db = firestore.client()
    except Exception as e:
        print(f"Error initializing Firebase Admin SDK: {e}")
        print("Please ensure the path to your service account key is correct and the file is accessible.")
        return

    print("\nAttempting to add sample worksheet to Firestore...")
    add_worksheet_to_firestore(db, SAMPLE_WORKSHEET_DATA)
    print("\nScript finished.")

if __name__ == "__main__":
    main()
