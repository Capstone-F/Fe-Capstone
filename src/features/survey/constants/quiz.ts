import { Question } from "../types/quiz";

export const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "Cảm giác của da sau khi rửa mặt khoảng 1 giờ (không thoa kem dưỡng)?",
    options: [
      { label: "Nhờn bóng toàn bộ khuôn mặt", value: "oily", key: "O" },
      { label: "Căng rát, bong tróc hoặc hơi ráp", value: "dry", key: "D" },
      {
        label: "Nhờn vùng chữ T (trán, mũi, cằm) nhưng khô ráp ở vùng má",
        value: "combination",
        key: "O",
      },
      { label: "Bình thường, dễ chịu và mềm mại", value: "normal", key: "O" },
    ],
  },
  {
    id: 2,
    text: "Khi tiếp xúc với mỹ phẩm lạ, cồn hoặc thời tiết thay đổi, da bạn phản ứng ra sao?",
    options: [
      {
        label: "Rất dễ mẩn đỏ, ngứa hoặc châm chích",
        value: "sensitive",
        key: "S",
      },
      {
        label: "Hầu như không bao giờ bị kích ứng",
        value: "resistant",
        key: "R",
      },
      {
        label: "Thỉnh thoảng hơi đỏ nhẹ rồi tự hết",
        value: "mild_sensitive",
        key: "S",
      },
    ],
  },
  {
    id: 3,
    text: "Mối lo ngại hoặc mục tiêu chăm sóc da lớn nhất của bạn là gì?",
    options: [
      { label: "Mụn ẩn, mụn sưng viêm hoặc vết thâm", value: "acne", key: "P" },
      {
        label: "Nếp nhăn, chảy xệ hoặc mong muốn chống lão hóa",
        value: "aging",
        key: "W",
      },
      {
        label: "Sạm nám, tàn nhang hoặc da không đều màu",
        value: "pigmentation",
        key: "P",
      },
      {
        label: "Lỗ chân lông to, bã nhờn tích tụ nhiều",
        value: "pores",
        key: "T",
      },
    ],
  },
];
