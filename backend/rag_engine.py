import os
import re
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
from google import genai
from google.genai import types
from legal_llm import generate_legal_draft, is_model_available

load_dotenv()

SYSTEM_GROUNDING_PROMPT = """
You are VoxLegal AI, an intelligent, professional legal AI agent and document intelligence advisor.

YOUR MISSION:
Deliver clear, concise, and accurate legal analysis based strictly on the uploaded document.

GUIDELINES & TONE:
1. Agentic & Direct:
   - Speak authoritatively, respectfully, and clearly like an experienced legal consultant.
   - Answer the user's question directly without repeating introductory greetings on every turn.

2. Clean Legal Citations (NO RAW PROOF DUMPS):
   - Answer the question directly in plain, professional English.
   - When referencing evidence, mention ONLY the relevant Clause Number and Page Number cleanly inline (e.g., "[Clause 3.1 (Page 1)]" or "Pursuant to Clause 4.2").
   - Do NOT repeat or dump long raw paragraphs of clauses as proof. Keep citations concise.

3. Factual Grounding:
   - Ground all factual assertions strictly in the provided document context.
   - If the document does not contain sufficient details to answer, state politely:
     "I could not find specific provisions regarding this in the uploaded document."

4. Disclaimer:
   - Briefly note that this analysis is for informational purposes only.
"""

SYSTEM_GROUNDING_WITH_LEGAL_LLM_PROMPT = """
You are VoxLegal AI, an intelligent, professional legal AI agent and document intelligence advisor.

You are provided with:
1. A preliminary statutory analysis from an Indian Legal domain model.
2. The retrieved document clauses.

GUIDELINES:
- Synthesize an authoritative, plain-language answer like a seasoned legal agent.
- Answer the user's question directly and concisely without repeating introductory greetings on every query.
- Seamlessly weave statutory points into your explanation where supported by the text.
- Cite evidence using ONLY the clause number and page (e.g., "[Clause 3.1]" or "Under Clause 5.2 (Page 1)").
- Do NOT dump full paragraphs of clauses as raw proof. Keep explanations smooth and professional.
- If the document context does not support the answer, state: "I could not find specific provisions regarding this in the uploaded document."
- Briefly note that this analysis is for informational purposes only.
"""

SUMMARY_PROMPT = """
You are VoxLegal AI, an expert legal document analyst.
Analyze the following clauses from an uploaded legal document and provide a structured Executive Summary.

FORMAT YOUR RESPONSE AS JSON with the following structure:
{
  "document_type": "e.g., Employment Agreement, Non-Disclosure Agreement, Commercial Lease, etc.",
  "executive_summary": "2-3 sentences explaining what this document is about and its main purpose.",
  "parties_involved": ["Party 1 description", "Party 2 description"],
  "key_conditions": [
    "Important condition 1 (with clause/page ref if available)",
    "Important condition 2 (with clause/page ref if available)"
  ],
  "core_obligations": [
    "Key obligation 1",
    "Key obligation 2"
  ],
  "termination_and_penalties": "Summary of termination rules, notice periods, and penalties.",
  "governing_law_and_disputes": "Governing jurisdiction and dispute resolution mechanism.",
  "important_takeaways": [
    "Crucial point 1",
    "Crucial point 2"
  ]
}

Return ONLY valid JSON.
"""

def detect_conversational_intent(query: str) -> Optional[str]:
    """
    Detects if the user is saying a greeting, pleasantry, or conversational question
    so the AI responds naturally like an agent without dumping legal clauses.
    """
    q = query.strip().lower()

    # Greetings
    if re.search(r"^\s*(hi|hello|hey|heya|hola|greetings|good\s+(morning|afternoon|evening|day))\b", q):
        return (
            "Hello! I am **VoxLegal AI**, your legal document intelligence assistant. "
            "I'm ready to help you analyze this document. You can ask me about notice periods, "
            "termination rules, obligations, liabilities, or governing law. What would you like to review?"
        )

    # How are you
    if re.search(r"^\s*(how\s+are\s+you|how\s+is\s+it\s+going|how's\s+it\s+going|how\s+do\s+you\s+do)\b", q):
        return (
            "I'm doing well, thank you! I have indexed your document and I'm ready to answer any questions. "
            "What terms or clauses would you like to explore?"
        )

    # Who are you / What can you do
    if re.search(r"^\s*(who\s+are\s+you|what\s+can\s+you\s+do|what\s+is\s+your\s+purpose|introduce\s+yourself|help)\b", q):
        return (
            "I am **VoxLegal AI**, an evidence-grounded legal document intelligence agent. "
            "I can review agreements, explain obligations in plain English, check statutory compliance "
            "under Indian law (such as the Contract Act and Arbitration Act), and answer your questions with precise clause citations."
        )

    # Thanks / gratitude
    if re.search(r"^\s*(thank\s+you|thanks|thx|much\s+appreciated|great|awesome|perfect|got\s+it|okay|ok)\b", q):
        return (
            "You're very welcome! If you have any more questions about your agreement or need specific clause explanations, just let me know."
        )

    return None


def construct_rag_context(retrieved_clauses: List[Dict[str, Any]]) -> str:
    """Format retrieved legal clauses into structured context for the LLM."""
    if not retrieved_clauses:
        return "No relevant legal clauses retrieved."

    context_parts = []
    for idx, clause in enumerate(retrieved_clauses, start=1):
        context_parts.append(
            f"[CLAUSE {idx}]\n"
            f"Page: {clause.get('page', 'N/A')}\n"
            f"Clause Number: {clause.get('clause', 'N/A')}\n"
            f"Section: {clause.get('section', 'General')}\n"
            f"Text: \"{clause.get('text', '')}\"\n"
        )
    return "\n".join(context_parts)


def generate_grounded_answer(query: str, retrieved_clauses: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Two-Tier RAG Pipeline with Conversational Agent Routing:
    1. If greeting/pleasantry -> Direct conversational agent response (no clause proof).
    2. If legal question -> Vector retrieval -> Legal LLM -> Gemini grounding -> Clean clause citation.
    """
    # 1. Check for conversational agent intent first
    conversational_response = detect_conversational_intent(query)
    if conversational_response:
        return {
            "query": query,
            "answer": conversational_response,
            "is_grounded": True,
            "evidence": [],
            "model_chain": "VoxLegal Agent"
        }

    if not retrieved_clauses:
        return {
            "query": query,
            "answer": "I could not find sufficient information about this in the uploaded document.",
            "is_grounded": False,
            "evidence": [],
            "model_chain": "None"
        }

    # Filter out retrieved clauses with very low similarity scores (noise)
    relevant_clauses = [c for c in retrieved_clauses if c.get("similarity_score", 0.0) >= 0.10]
    if not relevant_clauses:
        relevant_clauses = retrieved_clauses[:2]

    context = construct_rag_context(relevant_clauses)
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GCP_API_KEY")

    # Tier 1: Try generating a legal draft with the Fine-Tuned Indian Legal LLM
    preliminary_draft = None
    if is_model_available():
        try:
            print("[RAG Engine] Generating preliminary analysis with fine-tuned Indian Legal LLM...")
            preliminary_draft = generate_legal_draft(query, context)
        except Exception as e:
            print(f"[RAG Engine] Legal LLM draft error: {e}")

    model_chain = "Indian-Legal-LLM -> Gemini" if preliminary_draft else "Gemini (Direct Grounding)"
    answer_text = ""
    is_grounded = True

    if api_key:
        try:
            client = genai.Client(api_key=api_key)

            if preliminary_draft:
                prompt = (
                    f"{SYSTEM_GROUNDING_WITH_LEGAL_LLM_PROMPT}\n\n"
                    f"PRELIMINARY INDIAN LEGAL LLM ASSESSMENT:\n{preliminary_draft}\n\n"
                    f"RETRIEVED LEGAL DOCUMENT CONTEXT:\n{context}\n\n"
                    f"USER QUESTION: {query}"
                )
            else:
                prompt = f"{SYSTEM_GROUNDING_PROMPT}\n\nLEGAL DOCUMENT CONTEXT:\n{context}\n\nUSER QUESTION: {query}"

            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.2
                )
            )
            answer_text = response.text.strip()

            if "could not find" in answer_text.lower():
                is_grounded = False
        except Exception as e:
            print(f"[RAG Engine] Gemini API call error: {e}")
            if preliminary_draft:
                answer_text = f"{preliminary_draft}"
            else:
                citations = [f"Clause {c.get('clause')} (Page {c.get('page')})" for c in relevant_clauses[:2]]
                answer_text = f"According to the document, relevant provisions are set out in {', '.join(citations)}."
    else:
        if preliminary_draft:
            answer_text = f"{preliminary_draft}"
        else:
            citations = [f"Clause {c.get('clause')} (Page {c.get('page')})" for c in relevant_clauses[:2]]
            answer_text = f"According to the document, relevant provisions are set out in {', '.join(citations)}."

    # Return only clean citations (clause numbers & pages), not dumping whole paragraph proofs
    evidence_list = []
    if is_grounded and "could not find" not in answer_text.lower():
        seen_clauses = set()
        for c in relevant_clauses:
            clause_num = str(c.get("clause", "")).strip()
            if clause_num and clause_num not in seen_clauses:
                seen_clauses.add(clause_num)
                evidence_list.append({
                    "clause_id": c.get("clause_id"),
                    "page": c.get("page"),
                    "clause": c.get("clause"),
                    "section": c.get("section"),
                    "similarity_score": c.get("similarity_score", 0.0)
                })

    return {
        "query": query,
        "answer": answer_text,
        "is_grounded": is_grounded,
        "evidence": evidence_list,
        "model_chain": model_chain,
        "preliminary_legal_draft": preliminary_draft
    }


def generate_document_summary(clauses: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Generates an automated Executive Summary of what the document is about,
    key conditions, obligations, termination rules, and important things.
    """
    if not clauses:
        return {
            "document_type": "Unknown",
            "executive_summary": "No readable content found in the document.",
            "parties_involved": [],
            "key_conditions": [],
            "core_obligations": [],
            "termination_and_penalties": "Not specified",
            "governing_law_and_disputes": "Not specified",
            "important_takeaways": []
        }

    sample_clauses = clauses[:15]
    clauses_text = "\n\n".join([f"Clause {c.get('clause')}: {c.get('text')}" for c in sample_clauses])

    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GCP_API_KEY")
    if not api_key:
        return {
            "document_type": "Legal Document",
            "executive_summary": f"Indexed {len(clauses)} clauses from document. Connect Gemini API to view full AI synthesis.",
            "parties_involved": [],
            "key_conditions": [f"Clause {c.get('clause')}: {c.get('text')[:100]}..." for c in sample_clauses[:3]],
            "core_obligations": [],
            "termination_and_penalties": "See indexed termination clauses",
            "governing_law_and_disputes": "See governing law clauses",
            "important_takeaways": ["Review indexed clauses for specific details."]
        }

    try:
        import json
        client = genai.Client(api_key=api_key)
        prompt = f"{SUMMARY_PROMPT}\n\nLEGAL CLAUSES:\n{clauses_text}"
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )
        data = json.loads(response.text)
        return data
    except Exception as e:
        print(f"[RAG Engine] Summary generation error: {e}")
        return {
            "document_type": "Legal Agreement",
            "executive_summary": f"Successfully indexed {len(clauses)} clauses.",
            "parties_involved": [],
            "key_conditions": [],
            "core_obligations": [],
            "termination_and_penalties": "Check indexed clauses",
            "governing_law_and_disputes": "Check indexed clauses",
            "important_takeaways": []
        }
