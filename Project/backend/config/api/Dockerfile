FROM python:3.11.4-slim
ENV PYTHONUNBUFFERED=1

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY codebase/requirements.txt .

RUN : \
    && pip install pip --upgrade \
    && pip install setuptools --upgrade \
    && pip install -r requirements.txt \
    && python -m spacy download en_core_web_sm \
    && :

COPY codebase/ ./




