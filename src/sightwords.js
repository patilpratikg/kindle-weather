// Sight word of the day for an early reader.
// Words follow the Dolch pre-primer then primer lists, the usual first sight words at age 4-6.
// Each sentence marks the word in {braces} so the template can highlight it.

export const WORDS = [
  // Pre-primer
  ['a', 'I see {a} cat.'],
  ['I', '{I} can run.'],
  ['see', 'I {see} the sun.'],
  ['the', 'Look at {the} dog.'],
  ['can', 'I {can} jump.'],
  ['go', 'We {go} to school.'],
  ['to', 'I go {to} the park.'],
  ['up', 'The ball went {up}.'],
  ['down', 'Sit {down} here.'],
  ['in', 'The cat is {in} the box.'],
  ['is', 'It {is} a big tree.'],
  ['it', 'I like {it}.'],
  ['my', 'This is {my} hat.'],
  ['me', 'Come with {me}.'],
  ['we', '{We} can play.'],
  ['you', 'I love {you}.'],
  ['and', 'Mom {and} Dad.'],
  ['big', 'A {big} red bus.'],
  ['little', 'A {little} bird.'],
  ['look', '{Look} at me!'],
  ['come', '{Come} and see.'],
  ['play', 'Let us {play}.'],
  ['run', 'I can {run} fast.'],
  ['jump', 'Frogs {jump} high.'],
  ['help', 'Can you {help} me?'],
  ['here', 'Come {here}, please.'],
  ['where', '{Where} is my cat?'],
  ['not', 'It is {not} hot.'],
  ['one', 'I have {one} cake.'],
  ['two', 'I see {two} cows.'],
  ['three', '{Three} little pigs.'],
  ['red', 'A {red} apple.'],
  ['blue', 'The sky is {blue}.'],
  ['yellow', 'A {yellow} sun.'],
  ['for', 'This is {for} you.'],
  ['find', 'Can you {find} it?'],
  ['funny', 'A {funny} clown.'],
  ['make', 'We {make} a cake.'],
  ['said', 'Mom {said} yes.'],
  ['away', 'The bird flew {away}.'],
  // Primer
  ['he', '{He} is my friend.'],
  ['she', '{She} can sing.'],
  ['they', '{They} play ball.'],
  ['am', 'I {am} happy.'],
  ['are', 'We {are} home.'],
  ['at', 'Look {at} the moon.'],
  ['be', 'I will {be} good.'],
  ['do', 'I can {do} it!'],
  ['did', 'I {did} it!'],
  ['get', 'Go {get} the ball.'],
  ['have', 'I {have} a dog.'],
  ['like', 'I {like} milk.'],
  ['on', 'The cup is {on} the table.'],
  ['out', 'Let us go {out}.'],
  ['into', 'Jump {into} the pool.'],
  ['under', 'The cat is {under} the bed.'],
  ['with', 'Play {with} me.'],
  ['all', 'We {all} sing.'],
  ['no', '{No}, thank you.'],
  ['yes', '{Yes}, please!'],
  ['please', 'Milk, {please}.'],
  ['good', 'You are a {good} dog.'],
  ['new', 'I have {new} shoes.'],
  ['now', 'Come here {now}.'],
  ['soon', 'See you {soon}!'],
  ['too', 'I want to go {too}.'],
  ['so', 'I am {so} happy!'],
  ['this', '{This} is my book.'],
  ['that', '{That} is a big dog.'],
  ['there', 'The park is over {there}.'],
  ['what', '{What} is that?'],
  ['who', '{Who} is at the door?'],
  ['was', 'It {was} fun.'],
  ['went', 'We {went} to the zoo.'],
  ['came', 'Grandma {came} to see us.'],
  ['ran', 'The dog {ran} fast.'],
  ['saw', 'I {saw} a fish.'],
  ['ate', 'I {ate} my lunch.'],
  ['eat', 'Let us {eat}.'],
  ['ride', 'I {ride} my bike.'],
  ['say', '{Say} hello!'],
  ['want', 'I {want} a hug.'],
  ['will', 'I {will} help you.'],
  ['must', 'We {must} go to bed.'],
  ['our', 'This is {our} house.'],
  ['four', 'A cat has {four} legs.'],
  ['black', 'A {black} cat.'],
  ['brown', 'A {brown} bear.'],
  ['white', 'A {white} cloud.'],
  ['pretty', 'A {pretty} flower.'],
  ['well', 'Sleep {well}.'],
  ['but', 'I am small {but} strong.'],
];

// Simple deterministic shuffle so a given day always gets the same puzzle.
function seeded(seed) {
  let s = seed >>> 0 || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
}

// "Find the word" puzzle: the target appears `hits` times among other words.
export function findGrid(sw, size = 12, hits = 3) {
  const rand = seeded(sw.number * 7919);
  // Other words are all different, so only the target repeats. Prefer words already learned.
  const pool = WORDS.slice(0, Math.max(sw.number, size + 2)).map(([w]) => w).filter((w) => w !== sw.word);
  const others = [];
  while (others.length < size - hits && pool.length) others.push(pool.splice(Math.floor(rand() * pool.length), 1)[0]);
  const grid = [...others, ...Array(hits).fill(sw.word)];
  for (let i = grid.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [grid[i], grid[j]] = [grid[j], grid[i]];
  }
  return { grid, hits };
}

// Sentences of today's word and the last few, as a tiny read-alone story.
export const storyLines = (sw, count = 3) => {
  const lines = [sw.sentence];
  for (const w of sw.review.slice(0, count - 1)) {
    const entry = WORDS.find(([x]) => x === w);
    if (entry) lines.push(entry[1].replace(/[{}]/g, ''));
  }
  return lines;
};

// The n-th word in the sequence (looping through the list), with the words just before it to review.
export function wordAt(n, reviewCount = 3) {
  const at = (k) => WORDS[((k % WORDS.length) + WORDS.length) % WORDS.length];
  const [word, sentence] = at(n);
  const review = [];
  for (let k = 1; k <= reviewCount && n - k >= 0; k++) review.push(at(n - k)[0]);
  return { word, sentence, review, number: (n % WORDS.length) + 1, total: WORDS.length };
}

const dayIndex = (iso, startDate) => {
  const day = (d) => Date.UTC(...d.split('-').map((n, i) => (i === 1 ? n - 1 : +n)));
  return Math.max(0, Math.round((day(iso) - day(startDate)) / 86400000));
};
const toMin = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };

// Which word to show at a given date and time.
//   mode "refresh": a new word for every refresh slot of the day (e.g. every 30 min, 06:07-21:37)
//   mode "daily":   one word for the whole day
// Uses the clock rather than counting runs, so a late or skipped GitHub run doesn't shift words.
export function wordIndex(iso, minutes, sw) {
  const day = dayIndex(iso, sw.startDate);
  if (sw.mode !== 'refresh') return day;
  const start = toMin(sw.dayStart), end = toMin(sw.dayEnd);
  const perDay = Math.floor((end - start) / sw.slotMinutes) + 1;
  const slot = Math.min(perDay - 1, Math.max(0, Math.floor((minutes - start) / sw.slotMinutes)));
  return day * perDay + slot;
}

// Index of the first word of the next day.
export function firstWordIndex(iso, sw) {
  return wordIndex(iso, toMin(sw.dayStart), sw);
}

// Kept for the daily mode and older callers.
export const wordOfTheDay = (iso, startDate, reviewCount = 3) => wordAt(dayIndex(iso, startDate), reviewCount);
