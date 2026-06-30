from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage
from app.core.config import settings
from app.agents.checkin_summary.state import CheckInSummaryState
from app.agents.checkin_summary.prompts import SYSTEM_PROMPT, build_user_prompt
from app.agents.guardrails.pre import run_pre_guardrails
from app.agents.guardrails.post import run_post_guardrails


def _get_llm():
    return ChatGoogleGenerativeAI(
        model=settings.GEMINI_MODEL,
        google_api_key=settings.GOOGLE_API_KEY,
        temperature=0.7,
        max_output_tokens=300,
    )


def pre_guardrail_node(state: CheckInSummaryState) -> CheckInSummaryState:
    return run_pre_guardrails(state)


def llm_node(state: CheckInSummaryState) -> CheckInSummaryState:
    try:
        messages = [
            SystemMessage(content=SYSTEM_PROMPT),
            HumanMessage(content=build_user_prompt(state)),
        ]
        response = _get_llm().invoke(messages)
        return {**state, "raw_llm_response": response.content}
    except Exception as e:
        import traceback
        print(f"[LLM Node ERROR] {e}")
        traceback.print_exc()
        return {**state, "raw_llm_response": "", "error_message": str(e)}


def post_guardrail_node(state: CheckInSummaryState) -> CheckInSummaryState:
    return run_post_guardrails(state)
