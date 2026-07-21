export type Question = {
  id: number;
  text: string;
  options: {
    label: string;
    value: string;
    key: string; // O = Oily, D = Dry, S = Sensitive, R = Resistant, P = Pigmented, N = Non-pigmented, W = Wrinkled, T = Tight
  }[];
};
