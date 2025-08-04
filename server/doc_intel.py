import os
from dotenv import load_dotenv
from pathlib import Path
from azure.storage.blob import BlobServiceClient
from azure.ai.formrecognizer import DocumentAnalysisClient
from azure.core.credentials import AzureKeyCredential

load_dotenv(dotenv_path=Path(__file__).resolve().parent / ".env")

blob_conn_str = os.environ["AZURE_STORAGE_CONNECTION_STRING"]
storage_key = os.environ["AZURE_STORAGE_KEY"]
doc_intel_endpoint = os.environ["DOCUMENT_INTELLIGENCE_ENDPOINT"]
doc_intel_key = os.environ["DOCUMENT_INTELLIGENCE_KEY"]

blob_service = BlobServiceClient.from_connection_string(blob_conn_str)
doc_client = DocumentAnalysisClient(
    endpoint=doc_intel_endpoint,
    credential=AzureKeyCredential(doc_intel_key)
)

def extract_and_save_raw_text(container_name, blob_path):
    blob_client = blob_service.get_blob_client(container=container_name, blob=blob_path)
    download_stream = blob_client.download_blob()
    file_bytes = download_stream.readall()

    poller = doc_client.begin_analyze_document("prebuilt-read", document=file_bytes)
    result = poller.result()

    full_text = "\n".join([line.content for page in result.pages for line in page.lines])

    text_blob_path = f"{os.path.dirname(blob_path)}/raw_text.txt"
    text_blob_client = blob_service.get_blob_client(container=container_name, blob=text_blob_path)
    text_blob_client.upload_blob(full_text, overwrite=True)

    return text_blob_path
