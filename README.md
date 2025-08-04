# resumAI
ResumAI – Intelligent Resume Tailoring System
ResumAI is an AI-driven tool for automating resume tailoring. It ingests job descriptions and resume versions, analyzes them using semantic search and schema-based extraction, and generates tailored resumes using Azure OpenAI.

The system integrates Azure Data Lake for raw file storage, Azure Functions for processing, Cosmos DB for semi-structured document storage, and OpenAI for resume analysis and generation.

# What It Does
Ingests job descriptions (text, PDF, or screenshots) and resume versions

Extracts structured data such as skills, KPIs, tone, and cultural signals

Generates vector embeddings for semantic matching between jobs and resumes

Uses a retrieval-augmented generation (RAG) pipeline to pull the most relevant resume content

Generates tailored resumes with Azure OpenAI

Tracks outcomes such as callbacks and interviews for continuous improvement

# Technologies
Frontend: Custom-built React interface for job and resume upload and management

Backend: Python REST API running on Azure Functions

Cloud Services:

Azure Data Lake Storage Gen2 for organizing raw files

Azure Cosmos DB for storing semi-structured JSON documents with embeddings, extracted fields, and metadata (queried using a SQL-like syntax)

Azure OpenAI for analysis and resume generation

# Current Progress
Job description ingestion completed, including uploads and raw text processing

Resume ingestion in progress, with upload handling and schema-based parsing under development

Vector embeddings implemented for job descriptions, with expansion to resumes and tailored versions in progress

Tailored resume generation in the design phase, with the RAG pipeline under development

# Roadmap
Complete resume ingestion and schema mapping

Implement tailored resume generation with retrieval-augmented generation

Build a knowledge store for resume, job, and outcome tracking

Add dashboards for managing applications and tracking results

# Lessons Learned
Building React without scaffolding tools has deepened my understanding of its core concepts

Designing schema-driven pipelines clarified how to transform unstructured text into structured, queryable data

Working with Azure Functions, Data Lake, and OpenAI highlighted the complexity of orchestrating multiple cloud components

Using Cosmos DB reinforced the value of flexible, semi-structured document storage for evolving data models

Implementing retrieval-augmented generation (RAG) pipelines clarified how AI systems can access and use database-stored information through context retrieval and prompt augmentation
