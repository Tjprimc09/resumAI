import azure.functions as func
import logging
import uuid
import os
import json
from azure.storage.blob import BlobServiceClient, generate_blob_sas, BlobSasPermissions
from dotenv import load_dotenv
from pathlib import Path
from datetime import datetime, timedelta

app = func.FunctionApp()

@app.route(route="upload_job", methods=["POST"], auth_level=func.AuthLevel.ANONYMOUS)
def upload_job(req: func.HttpRequest) -> func.HttpResponse:
    load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / "server" / ".env")

    logging.info("Received job upload request")

    try:
        content_type = req.headers.get("Content-Type", "")

        job_id = str(uuid.uuid4())
        container_name = "job-descriptions"
        blob_conn_str = os.environ.get("AZURE_STORAGE_CONNECTION_STRING", "").strip().replace('\r', '').replace('\n', '')
        storage_key = os.environ.get("AZURE_STORAGE_KEY", "").strip()

        blob_service = BlobServiceClient.from_connection_string(blob_conn_str)

        if "application/json" in content_type:
            data = req.get_json()
            raw_text = data.get("raw_text")
            if not raw_text:
                return func.HttpResponse("Missing 'raw_text' field", status_code=400)

            blob_path = f"{job_id}/raw_text.txt"
            blob_client = blob_service.get_blob_client(container=container_name, blob=blob_path)
            blob_client.upload_blob(raw_text, overwrite=True)

            sas_token = generate_blob_sas(
                account_name=blob_client.account_name,
                container_name=blob_client.container_name,
                blob_name=blob_client.blob_name,
                account_key=storage_key,
                permission=BlobSasPermissions(read=True),
                expiry=datetime.utcnow() + timedelta(hours=1)
            )

            blob_url = f"https://{blob_client.account_name}.blob.core.windows.net/{blob_client.container_name}/{blob_client.blob_name}?{sas_token}"

            return func.HttpResponse(
                json.dumps({"job_id": job_id, "blob_url": blob_url}),
                status_code=200,
                mimetype="application/json"
            )

        elif "multipart/form-data" in content_type:
            formdata = req.files or req.form
            file = formdata.get("file")
            if not file:
                return func.HttpResponse("No file uploaded", status_code=400)

            filename = file.filename
            file_bytes = file.stream.read()

            blob_path = f"{job_id}/{filename}"
            blob_client = blob_service.get_blob_client(container=container_name, blob=blob_path)
            blob_client.upload_blob(file_bytes, overwrite=True)

            sas_token = generate_blob_sas(
                account_name=blob_client.account_name,
                container_name=blob_client.container_name,
                blob_name=blob_client.blob_name,
                account_key=storage_key,
                permission=BlobSasPermissions(read=True),
                expiry=datetime.utcnow() + timedelta(hours=1)
            )

            blob_url = f"https://{blob_client.account_name}.blob.core.windows.net/{blob_client.container_name}/{blob_client.blob_name}?{sas_token}"

            return func.HttpResponse(
                json.dumps({"job_id": job_id, "blob_url": blob_url}),
                status_code=200,
                mimetype="application/json"
            )

        else:
            return func.HttpResponse("Unsupported Content-Type", status_code=415)

    except Exception as e:
        logging.error(f"Upload error: {str(e)}")
        return func.HttpResponse(f"Server error: {str(e)}", status_code=500)
