import io
import zipfile
from typing import List
from app.models.generated_file import GeneratedFile
from app.models.documentation import DocumentationItem


class ZipExportService:
    @staticmethod
    def create_project_zip(project_name: str, files: List[GeneratedFile], docs: List[DocumentationItem]) -> io.BytesIO:
        zip_buffer = io.BytesIO()
        sanitized_folder = project_name.lower().replace(" ", "-").replace("/", "-")

        with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
            # 1. Add all generated source code and configuration files
            for f in files:
                # Security rule: Never package actual .env files or hardcoded server keys
                if f.path.endswith(".env") and not f.path.endswith(".env.example"):
                    continue
                
                archive_path = f"{sanitized_folder}/{f.path.lstrip('/')}"
                zip_file.writestr(archive_path, f.content)

            # 2. Add all documentation files
            for d in docs:
                doc_filename = f"{d.doc_type.upper()}.md"
                if d.doc_type.lower() == "readme":
                    doc_filename = "README.md"
                
                doc_path = f"{sanitized_folder}/docs/{doc_filename}"
                if d.doc_type.lower() == "readme":
                    doc_path = f"{sanitized_folder}/README.md"
                
                zip_file.writestr(doc_path, d.markdown_content)

        zip_buffer.seek(0)
        return zip_buffer
