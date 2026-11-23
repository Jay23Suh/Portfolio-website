// Prompt v0 (the thesis prompt), generated from pairwise-evals bench/prompts/v0.txt.
// $task_key renders as the thesis task names; $task_question as the task questions below.
export const PROMPT_VERSION = "v0";
export const PROMPT_SHA256 = "a67960aade01403a9a1ba2f2739133c3117e43508b442479c4bdcf58eb4e3a02";
export const PROMPT_SYSTEM = "You are a vision researcher evaluating shape perception. Be decisive; humans rarely answer 'tie'. Your reply **must** be a single valid JSON object that exactly follows the schema provided. Do not write any commentary, explanation, or markdown. Respond strictly in JSON matching the schema.";
export const PROMPT_USER = "You are a participant in a human perception study.\n\nTask: $task_question\n\nGuidelines:\n- Look carefully at both shapes and decide which one a *typical human* would perceive as even slightly more\n  $task_key. Humans almost always notice a small difference.\n- Choose \"tie\" only if the two shapes appear virtually identical in all respects.\n- Ensure your response is a single complete JSON object. Do not add any commentary.\n- Base your judgment entirely on what you can see in the images (shape, symmetry, irregularity, detail).\n- All numeric fields must contain valid decimals (e.g., 0.6 or 0.75). Do not use '.' or leave them blank.\n- If the images do not display or you truly cannot see them, return the null JSON shown below.\n\nIf you cannot see both images, respond with:\n{\n  \"task\": \"$task_key\",\n  \"harder\": null,\n  \"confidence\": 0.0,\n  \"difficulty_A\": 0.0,\n  \"difficulty_B\": 0.0,\n  \"justification\": \"Could not see or access the images.\"\n}\n\nOtherwise, return ONLY one valid JSON object\u2014no extra text, markdown, or commentary:\n\n{\n  \"task\": \"$task_key\",\n  \"harder\": \"A\" | \"B\" | \"tie\",\n  \"confidence\": number in [0,1],\n  \"difficulty_A\": number in [0,1],\n  \"difficulty_B\": number in [0,1],\n  \"justification\": \"one concise human-style reason\"\n}\nRespond only with JSON.";
export const PROMPT_TASKS: Record<string, string> = {
  "complex": "Which shape would a typical human *perceive as more visually complex* overall?",
  "memory": "Which shape would be *harder for a typical human to draw accurately from memory after a brief look*?",
  "cut": "Which shape would be *harder for a typical human to cut out cleanly with scissors*?",
  "trace": "Which shape would be *harder for a typical human to trace neatly with a pencil*?"
};
export const PROMPT_TASK_KEYS: Record<string, string> = {
  "complex": "complexity",
  "memory": "memory",
  "cut": "cutting",
  "trace": "tracing"
};
