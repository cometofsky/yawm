#!/bin/bash
# .agents/tools/dump_iyyam_ctx.sh
# Dumps critical Context for iyyam

OUTPUT_FILE=".agents/context_dump.md"

echo "# iyyam Context Dump" > "$OUTPUT_FILE"
echo "Generated at: $(date)" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

echo "## 1. Global AI Rules (AGENTS.md)" >> "$OUTPUT_FILE"
echo '```markdown' >> "$OUTPUT_FILE"
cat AGENTS.md >> "$OUTPUT_FILE" 2>/dev/null || echo "AGENTS.md not found" >> "$OUTPUT_FILE"
echo '```' >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

echo "## 2. Hijri Resolver Signature (app/lib/hijri.ts)" >> "$OUTPUT_FILE"
echo '```typescript' >> "$OUTPUT_FILE"
cat app/lib/hijri.ts >> "$OUTPUT_FILE" 2>/dev/null || echo "app/lib/hijri.ts not found" >> "$OUTPUT_FILE"
echo '```' >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

echo "Context dumped successfully to $OUTPUT_FILE"
