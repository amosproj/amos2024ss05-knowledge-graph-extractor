import json
import re


def transform_llm_output_to_dict(llm_output) -> dict:
    # todo- Refactor and extract into separate task
    #  needs to become more reliable

    x = re.search(r"\[.*?\]", llm_output, re.DOTALL)
    if x is None:
        return {}
    try:
        relation = json.loads(x.group(0))
    except json.JSONDecodeError:
        return {}
    return relation
