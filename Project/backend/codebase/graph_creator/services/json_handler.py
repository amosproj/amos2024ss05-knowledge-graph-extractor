import json
import re


def transform_llm_output_to_dict(llm_output) -> dict:
    # Remove any leading comments or unnecessary text
    llm_output = re.sub(r"^.*?(\[)", "[", llm_output, flags=re.DOTALL)

    # Remove any trailing characters after the JSON structure
    llm_output = re.sub(r"(\]).*$", "]", llm_output, flags=re.DOTALL)

    # Correct double commas
    llm_output = llm_output.replace(",,", ",")

    # Remove any comments inside JSON
    llm_output = re.sub(r"//.*?\n|/\*.*?\*/", "", llm_output, flags=re.DOTALL)

    # Remove extra commas before closing brackets/parentheses
    llm_output = re.sub(r",\s*(\}|\])", r"\1", llm_output)

    # Find the JSON array in the string
    x = re.search(r"\[.*?\]", llm_output, re.DOTALL)
    if x is None:
        return {}

    # Try to load the JSON
    try:
        relation = json.loads(x.group(0))
    except json.JSONDecodeError:
        return {}

    return relation