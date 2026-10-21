import { User } from '../models/User.model';
import { Board } from '../models/Board.model';
import { List } from '../models/List.model';
import { Card } from '../models/Card.model';

export const DEMO_USER = {
  email: 'demo@example.com',
  password: 'demo1234',
  name: 'Demo User',
};

interface DemoCard {
  title: string;
  description?: string;
  labels: string[];
  /** Days from today; negative means overdue. */
  dueInDays?: number;
  comments?: string[];
}

const DEMO_LISTS: { title: string; cards: DemoCard[] }[] = [
  {
    title: 'To Do',
    cards: [
      {
        title: 'Write launch announcement',
        description: 'Blog post and newsletter copy for the v2 launch.',
        labels: ['marketing'],
        dueInDays: 6,
      },
      {
        title: 'Set up error monitoring',
        description: 'Add alerts for 5xx spikes and failed logins.',
        labels: ['backend', 'ops'],
        dueInDays: 9,
      },
      {
        title: 'Design onboarding checklist',
        labels: ['design', 'ux'],
        dueInDays: 12,
      },
    ],
  },
  {
    title: 'In Progress',
    cards: [
      {
        title: 'Drag-and-drop card ordering',
        description: 'Persist card positions when moving cards within and between lists.',
        labels: ['frontend', 'feature'],
        dueInDays: 2,
        comments: ['Within-list reordering works, testing cross-list moves next.'],
      },
      {
        title: 'Rate-limit the auth endpoints',
        description: 'Limit login and signup attempts per IP.',
        labels: ['backend', 'security'],
        dueInDays: -1,
      },
      {
        title: 'Mobile layout for boards',
        labels: ['frontend', 'ux'],
        dueInDays: 4,
      },
    ],
  },
  {
    title: 'Done',
    cards: [
      {
        title: 'JWT authentication',
        description: 'Signup, login and protected routes.',
        labels: ['backend', 'security'],
        dueInDays: -7,
      },
      {
        title: 'Board, list and card CRUD',
        labels: ['backend', 'frontend'],
        dueInDays: -4,
      },
    ],
  },
];

function daysFromToday(days: number): Date {
  const date = new Date();
  date.setUTCHours(12, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + days);
  return date;
}

/**
 * Creates the demo user with one example board. Safe to run repeatedly: any
 * existing demo user and their boards are removed first, and no other user's
 * data is touched.
 */
export async function seedDemoData(): Promise<void> {
  const existing = await User.findOne({ email: DEMO_USER.email });
  if (existing) {
    const boards = await Board.find({ owner: existing._id }).select('_id');
    const boardIds = boards.map((b) => b._id);
    await Card.deleteMany({ board: { $in: boardIds } });
    await List.deleteMany({ board: { $in: boardIds } });
    await Board.deleteMany({ _id: { $in: boardIds } });
    await existing.deleteOne();
  }

  const user = await User.create(DEMO_USER);
  const board = await Board.create({
    title: 'Product Launch',
    description: 'Tasks for shipping v2',
    color: '#3B82F6',
    owner: user._id,
    members: [],
  });

  for (const [listIndex, demoList] of DEMO_LISTS.entries()) {
    const list = await List.create({ title: demoList.title, board: board._id, position: listIndex });
    await Card.insertMany(
      demoList.cards.map((card, position) => ({
        title: card.title,
        description: card.description,
        labels: card.labels,
        dueDate: card.dueInDays === undefined ? undefined : daysFromToday(card.dueInDays),
        list: list._id,
        board: board._id,
        position,
        comments: (card.comments ?? []).map((text) => ({ author: user._id, text })),
      }))
    );
  }

  const cardCount = DEMO_LISTS.reduce((sum, l) => sum + l.cards.length, 0);
  console.log(
    `Seeded ${DEMO_USER.email} / ${DEMO_USER.password} with board "${board.title}" ` +
      `(${DEMO_LISTS.length} lists, ${cardCount} cards)`
  );
}
