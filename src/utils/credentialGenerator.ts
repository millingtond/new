// src/utils/credentialGenerator.ts
const adjectives = [
  'Agile', 'Bright', 'Clever', 'Quick', 'Sharp', 'Wise', 'Swift', 'Keen', 'Calm', 'Brave',
  'Eager', 'Exact', 'Fair', 'Fine', 'Glad', 'Grand', 'Great', 'Happy', 'Jolly', 'Kind',
  'Lively', 'Lone', 'Lucid', 'Major', 'Merry', 'Neat', 'Noble', 'Prime', 'Proud', 'Ready',
  'Regal', 'Solid', 'Sound', 'Stark', 'Super', 'Topaz', 'True', 'Valid', 'Vivid', 'Warm'
];
const nouns = [
  'Ant', 'Ape', 'Bat', 'Bear', 'Bee', 'Bird', 'Boar', 'Bug', 'Cat', 'Cod',
  'Cow', 'Crab', 'Crow', 'Cub', 'Deer', 'Dog', 'Dove', 'Duck', 'Elk', 'Emu',
  'Fish', 'Flea', 'Fly', 'Fox', 'Frog', 'Gnat', 'Goat', 'Grub', 'Hawk', 'Hen',
  'Ibex', 'Jay', 'Lamb', 'Lion', 'Lark', 'Mole', 'Moth', 'Mule', 'Newt', 'Owl',
  'Pig', 'Puma', 'Pup', 'Ram', 'Rat', 'Seal', 'Slug', 'Snail', 'Swan', 'Tiger',
  'Toad', 'Trout', 'Wolf', 'Worm', 'Yak', 'Zebra'
];

export function generateTwoWordUsername(): string {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomNumber = Math.floor(Math.random() * 90) + 10;
  return `${adj.toLowerCase()}-${noun.toLowerCase()}${randomNumber}`;
}

export function generateStrongPassword(length: number = 10): string {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
  let password = "";
  for (let i = 0, n = charset.length; i < length; ++i) {
    password += charset.charAt(Math.floor(Math.random() * n));
  }
  if (!/\d/.test(password)) password += Math.floor(Math.random() * 10);
  if (!/[A-Z]/.test(password)) password += String.fromCharCode(65 + Math.floor(Math.random() * 26));
  if (!/[a-z]/.test(password)) password += String.fromCharCode(97 + Math.floor(Math.random() * 26));
  return password.slice(0, length);
}
