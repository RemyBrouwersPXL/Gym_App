// Placeholder Unsplash photos, matched to exercises by muscle group keyword in the name.

const unsplash = (id: string, w = 800) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=80&fit=crop&auto=format`;

const PHOTOS = {
  chest: ['1584466977773-e625c37cdd50', '1598971639058-fab3c3109a00'],
  shoulders: ['1574680096145-d05b474e2155', '1541534741688-6078c6bfb5c5'],
  back: ['1532029837206-abbe2b7620e3', '1526506118085-60ce8714f8c5', '1605296867304-46d5465a13f1'],
  arms: ['1581009146145-b5ef050c2e1e', '1583454110551-21f2fa2afe61'],
  legs: ['1517836357463-d25dfeac3438', '1541534741688-6078c6bfb5c5'],
  gym: ['1534438327276-14e5300c3a48', '1590487988256-9ed24133863e'],
};

type Group = keyof typeof PHOTOS;

// Checked in order, so "Rear Delt Fly" hits shoulders before chest and "Hamstring Curl" hits legs before arms.
const KEYWORDS: [RegExp, Group][] = [
  [/shoulder|lateral|delt/i, 'shoulders'],
  [/squat|leg|hamstring|calf/i, 'legs'],
  [/curl|tricep|pushdown|rope|dip/i, 'arms'],
  [/pulldown|row|pull/i, 'back'],
  [/press|fly|chest/i, 'chest'],
];

export function exerciseImage(name: string, index = 0) {
  const group = KEYWORDS.find(([re]) => re.test(name))?.[1] ?? 'gym';
  const list = PHOTOS[group];
  return unsplash(list[index % list.length], 300);
}

const DAY_PHOTOS: Record<string, string> = {
  day1: PHOTOS.chest[0],
  day2: PHOTOS.back[0],
  day3: PHOTOS.legs[0],
  day5: PHOTOS.arms[0],
  day6: PHOTOS.shoulders[0],
};

export const dayImage = (dayId: string) => unsplash(DAY_PHOTOS[dayId] ?? PHOTOS.gym[0]);
