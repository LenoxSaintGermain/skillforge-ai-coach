#!/bin/bash

# Ensure the .agents/workflows directory exists
mkdir -p /Users/euxvl/Documents/Vibecoding/skillforge-ai-coach/.agents/workflows/superpowers

# Copy the superpowers
echo "Copying superpowers skills to local workflows directory..."

# The repository was cloned to /tmp/superpowers
SOURCE_DIR="/tmp/superpowers/skills"
DEST_DIR="/Users/euxvl/Documents/Vibecoding/skillforge-ai-coach/.agents/workflows/superpowers"

if [ ! -d "$SOURCE_DIR" ]; then
    echo "Error: Source directory $SOURCE_DIR not found. Was it cloned successfully?"
    exit 1
fi

COUNT=0

# Iterate through all skill directories
for dir in "$SOURCE_DIR"/*/; do
    if [ -d "$dir" ]; then
        skill_name=$(basename "$dir")
        skill_file="$dir/SKILL.md"
        
        if [ -f "$skill_file" ]; then
            # We copy the SKILL.md file and rename it to the skill's name (e.g., test-driven-development.md)
            cp "$skill_file" "$DEST_DIR/${skill_name}.md"
            echo "Ingested: ${skill_name}"
            COUNT=$((COUNT + 1))
        fi
    fi
done

echo
echo "Successfully ingested $COUNT superpower skills into .agents/workflows/superpowers"
