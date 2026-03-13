require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Ensure database URL exists
const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:54322/postgres';

const pool = new Pool({
  connectionString: dbUrl,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function seedSuperpowers() {
  const client = await pool.connect();
  
  try {
    console.log('Starting Superpowers database seeding...');
    await client.query('BEGIN');

    // 1. Create the Subject
    const subjectResult = await client.query(`
      INSERT INTO learning_subjects (title, description, icon, difficulty_level, estimated_hours)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (title) 
      DO UPDATE SET description = EXCLUDED.description
      RETURNING id
    `, [
      "AI-Assisted Software Engineering", 
      "Advanced techniques for using AI coding agents. Includes rigorous Test-Driven Development loops, systematic debugging, planning pipelines, and agent collaboration patterns.", 
      "Zap", 
      "advanced", 
      10
    ]);
    
    const subjectId = subjectResult.rows[0].id;
    console.log(`✓ Ensured subject exists: AI-Assisted Software Engineering (ID: ${subjectId})`);

    // 2. Read the SKILL.md files and insert them as resources
    const skillsDir = '/tmp/superpowers/skills';
    let insertedCount = 0;

    if (fs.existsSync(skillsDir)) {
      const skillFolders = fs.readdirSync(skillsDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

      for (const folder of skillFolders) {
        const skillPath = path.join(skillsDir, folder, 'SKILL.md');
        if (fs.existsSync(skillPath)) {
          const content = fs.readFileSync(skillPath, 'utf8');
          
          await client.query(`
            INSERT INTO learning_resources (title, description, type, url, external_id, provider, raw_content, learning_subject_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (external_id) 
            DO UPDATE SET raw_content = EXCLUDED.raw_content
            RETURNING id
          `, [
            `Superpower Skill: ${folder}`,
            `Advanced AI Coding Agent skill for ${folder.replace(/-/g, ' ')}.`,
            'article', // Close enough representation
            `https://github.com/obra/superpowers/tree/main/skills/${folder}`,
            `superpower-${folder}`,
            'obra/superpowers',
            content,
            subjectId
          ]);
          insertedCount++;
        }
      }
      console.log(`✓ Inserted/Updated ${insertedCount} Superpower skills as Learning Resources.`);
    } else {
       console.log('! Warning: /tmp/superpowers/skills directory not found. Skills not loaded.');
    }

    // 3. Create a specialized prompt experiment for this subject
    await client.query(`
      INSERT INTO prompt_experiments (name, description, system_prompt, target_model, is_active, metadata)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (name) 
      DO UPDATE SET system_prompt = EXCLUDED.system_prompt
    `, [
      "Superpower AI Coach",
      "Specialized prompt for teaching the rigid AI Engineering skills from the obra/superpowers repository.",
      "You are an elite Staff Engineer coaching the user on how to use AI coding agents using the 'Superpowers' framework. When the user asks about Test-Driven Development (TDD) or Systematic Debugging, you MUST strictly enforce the rules defined in the provided learning resources. Do not permit them to skip steps. Output the relevant checklists and force them to operate in the Red-Green-Refactor cycle or the 4-phase debugging process.",
      "gemini-2.5-pro",
      true,
      JSON.stringify({ target_subject: "AI-Assisted Software Engineering" })
    ]);
    console.log(`✓ Ensured 'Superpower AI Coach' prompt experiment exists.`);


    await client.query('COMMIT');
    console.log('Database seeding successfully completed.');

  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Error during seeding, rolling back transaction:', e);
  } finally {
    client.release();
    await pool.end();
  }
}

seedSuperpowers();
