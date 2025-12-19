from flask import Flask, request, jsonify
from flask_cors import CORS
import boto3
import os
from dotenv import load_dotenv
from botocore.config import Config


load_dotenv()

app = Flask(__name__)
CORS(app)

s3 = boto3.client(
    "s3",
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    region_name=os.getenv("AWS_REGION"),
    config=Config(signature_version="s3v4")
)


BUCKET_NAME = os.getenv("S3_BUCKET_NAME")


@app.route("/")
def home():
    return "CloudVault Backend is running"


@app.route("/upload", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    try:
        s3.upload_fileobj(
            file,
            BUCKET_NAME,
            file.filename
        )

        return jsonify({
            "message": "File uploaded successfully",
            "filename": file.filename
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@app.route("/files", methods=["GET"])
def list_files():
    try:
        response = s3.list_objects_v2(Bucket=BUCKET_NAME)
        files = []

        if "Contents" in response:
            for obj in response["Contents"]:
                filename = obj["Key"]

                params = {
                    "Bucket": BUCKET_NAME,
                    "Key": filename
                }

                if filename.lower().endswith((".jpg", ".jpeg", ".png", ".webp", ".gif")):
                    params["ResponseContentType"] = "image/*"
                    params["ResponseContentDisposition"] = "inline"

                url = s3.generate_presigned_url(
                    "get_object",
                    Params=params,
                    ExpiresIn=3600
                )

                files.append({
                    "name": filename,
                    "url": url
                })

        return jsonify(files)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/delete/<filename>", methods=["DELETE"])
def delete_file(filename):
    try:
        s3.delete_object(
            Bucket=BUCKET_NAME,
            Key=filename
        )

        return jsonify({
            "message": "File deleted successfully",
            "filename": filename
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
