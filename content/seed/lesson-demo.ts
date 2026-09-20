import { createHash } from "node:crypto";
import type { ItemType, PrismaClient } from "@prisma/client";
import { getExerciseType } from "../../core/exercise-engine";

// Hand-authored demo content for Phase 1 (exercise engine end-to-end), themed around
// business/work phrasal verbs (SPEC.md section 3.1's own example unit). This is NOT the
// content pipeline (that's Phase 4, LLM-generated + reviewed, see SPEC.md section 6.1) -
// it exists to prove the lesson runner works against real data, one item per exercise type
// implemented so far, plus a couple of extra exam-native ones.
interface DemoItem {
  type: ItemType;
  payload: object;
  solution: object;
  explanation: string;
}

const DEMO_ITEMS: DemoItem[] = [
  {
    type: "MCQ_CLOZE",
    payload: {
      context: "The board decided to ___ the investigation into the accounting irregularities themselves.",
      options: ["carry out", "carry on", "carry off", "carry over"],
    },
    solution: { correctIndex: 0 },
    explanation:
      "'Carry out' means to perform or conduct a task, such as an investigation. 'Carry on' means to continue; 'carry off' means to succeed at something difficult or impressive; 'carry over' means to postpone or transfer something to a later time.",
  },
  {
    type: "MCQ_CLOZE",
    payload: {
      context: "Despite losing two senior directors, the team somehow managed to ___ as if nothing had happened.",
      options: ["carry out", "carry on", "carry off", "carry over"],
    },
    solution: { correctIndex: 1 },
    explanation:
      "'Carry on' means to continue, especially despite difficulty. The other options don't fit: 'carry out' takes a task as its object, 'carry off' means to succeed at something impressive, 'carry over' means to postpone.",
  },
  {
    type: "OPEN_CLOZE",
    payload: { context: "The manager asked her assistant to follow ___ on the client's complaint before Friday." },
    solution: { acceptedAnswers: ["up"] },
    explanation: "'Follow up on' is a fixed phrasal verb meaning to check on the progress of something.",
  },
  {
    type: "OPEN_CLOZE",
    payload: { context: "It took the committee three meetings to come ___ with a solution everyone could agree on." },
    solution: { acceptedAnswers: ["up"] },
    explanation: "'Come up with' means to think of or produce an idea, plan or solution.",
  },
  {
    type: "WORD_FORMATION",
    payload: { context: "The consultant's ___ of the failed merger was blunt but fair.", rootWord: "ASSESS" },
    solution: { acceptedAnswers: ["assessment"] },
    explanation: "The noun form of the verb 'assess' is 'assessment'.",
  },
  {
    type: "KEY_WORD_TRANSFORMATION",
    payload: {
      originalSentence: "I regret not asking for more details before I signed the contract.",
      keyWord: "WISH",
      gappedSentence: "I _______________ more details before I signed the contract.",
    },
    solution: {
      acceptedVariants: ["wish I had asked for", "wish I'd asked for"],
      parts: [
        ["wish i had", "wish i'd"],
        ["asked for"],
      ],
    },
    explanation:
      "'Wish + past perfect' (wish I had asked) expresses regret about a past action, replacing 'I regret not doing'. This tests hypothetical/regret structures with 'wish'.",
  },
  {
    type: "KEY_WORD_TRANSFORMATION",
    payload: {
      originalSentence: "It is thought that the CEO will step down before the end of the financial year.",
      keyWord: "EXPECTED",
      gappedSentence: "The CEO _______________ before the end of the financial year.",
    },
    solution: {
      acceptedVariants: ["is expected to step down"],
      parts: [["is expected to"], ["step down"]],
    },
    explanation:
      "The passive reporting structure 'is expected to + infinitive' replaces 'It is thought that ... will'. Tests passive report structures with 'expect'.",
  },
  {
    type: "FLASHCARD",
    payload: { front: "step down", back: "to resign from an important job or position" },
    solution: {},
    explanation: "'Step down' is common in business news to describe an executive resigning, often voluntarily.",
  },
  {
    type: "TYPE_THE_WORD",
    payload: { prompt: "Which two-word phrasal verb means 'to investigate or examine a problem'?" },
    solution: { acceptedAnswers: ["look into"] },
    explanation: "'Look into' means to investigate or examine an issue.",
  },
  {
    type: "COLLOCATION_MATCH",
    payload: {
      left: ["carry out", "come up with", "follow up on", "take on"],
      right: ["a solution", "an investigation", "a new role", "a complaint"],
    },
    solution: { correctPairs: [1, 0, 3, 2] },
    explanation: "Each phrasal verb has a typical object it collocates with in business English.",
  },
  {
    type: "ODD_ONE_OUT",
    payload: { words: ["carry out", "conduct", "perform", "postpone"] },
    solution: { oddIndex: 3 },
    explanation:
      "'Carry out', 'conduct' and 'perform' all mean to do or execute a task. 'Postpone' means to delay something to a later time, so it doesn't belong.",
  },
  {
    type: "SENTENCE_BUILD",
    payload: { blocks: ["until further notice", "The launch", "postponed", "was"] },
    solution: { correctOrder: [1, 3, 2, 0] },
    explanation:
      "Standard word order: subject (The launch) + passive verb (was postponed) + adverbial (until further notice).",
  },
];

function hashOf(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

export async function seedLessonDemo(prisma: PrismaClient) {
  const track = await prisma.track.findUniqueOrThrow({ where: { code: "USE_OF_ENGLISH" } });

  const unit = await prisma.unit.upsert({
    where: { trackId_order: { trackId: track.id, order: 1 } },
    update: {},
    create: {
      trackId: track.id,
      order: 1,
      title: "Phrasal verbs: business & work",
      description: "Everyday phrasal verbs and collocations used in a professional context.",
      cefrFocus: "C1",
    },
  });

  const skill = await prisma.skill.upsert({
    where: { unitId_order: { unitId: unit.id, order: 1 } },
    update: {},
    create: {
      unitId: unit.id,
      order: 1,
      title: "Everyday business phrasal verbs",
      tags: ["phrasal-verbs", "business"],
    },
  });

  const items = [];
  for (const demoItem of DEMO_ITEMS) {
    // Fail loudly at seed time, not at lesson runtime, if hand-authored content doesn't
    // match its own exercise type's schema.
    const exercise = getExerciseType(demoItem.type);
    exercise.payloadSchema.parse(demoItem.payload);
    exercise.solutionSchema.parse(demoItem.solution);

    const sourceHash = hashOf(`${demoItem.type}:${JSON.stringify(demoItem.payload)}`);
    const item = await prisma.item.upsert({
      where: { sourceHash },
      update: {
        payload: demoItem.payload,
        solution: demoItem.solution,
        explanation: demoItem.explanation,
      },
      create: {
        skillId: skill.id,
        type: demoItem.type,
        payload: demoItem.payload,
        solution: demoItem.solution,
        explanation: demoItem.explanation,
        status: "PUBLISHED",
        createdBy: "seed:phase-1",
        sourceHash,
      },
    });
    items.push(item);
  }

  const lesson = await prisma.lesson.upsert({
    where: { skillId_order: { skillId: skill.id, order: 1 } },
    update: {},
    create: { skillId: skill.id, order: 1, type: "LEARN" },
  });

  for (const [index, item] of items.entries()) {
    await prisma.lessonItem.upsert({
      where: { lessonId_itemId: { lessonId: lesson.id, itemId: item.id } },
      update: { order: index + 1 },
      create: { lessonId: lesson.id, itemId: item.id, order: index + 1 },
    });
  }

  return { lessonId: lesson.id, itemCount: items.length };
}
