"use client";

import { useState } from "react";
import { ArrowRight, Sparkles, RefreshCw, CheckCircle2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

import { QUESTIONS } from "../constants/quiz";

export function QuizWidget() {
  const [step, setStep] = useState(0); // 0: Welcome, 1-3: Questions, 4: Result
  const [answers, setAnswers] = useState<string[]>([]);
  const [skinProfile, setSkinProfile] = useState({
    type: "",
    desc: "",
    actives: [] as string[],
  });

  const handleStart = () => {
    setAnswers([]);
    setStep(1);
  };

  const handleSelectOption = (key: string) => {
    const newAnswers = [...answers, key];
    setAnswers(newAnswers);

    if (step < QUESTIONS.length) {
      setStep(step + 1);
    } else {
      // Calculate basic skin type candidate based on answers
      // answers[0]: O/D, answers[1]: S/R, answers[2]: P/W/T
      const isOily = newAnswers[0] === "O";
      const isSensitive = newAnswers[1] === "S";
      const mainConcern = newAnswers[2];

      let typeStr = "";
      let descStr = "";
      let activeList: string[] = [];

      if (isOily && isSensitive) {
        typeStr = "Da dầu nhạy cảm (OS - Oily Sensitive)";
        descStr =
          "Da bạn tiết nhiều dầu thừa nhưng lại rất dễ bị kích ứng, nổi mụn đỏ hoặc châm chích. Hàng rào bảo vệ da đang bị suy yếu, cần tập trung làm dịu và kiểm soát nhờn nhẹ nhàng.";
        activeList = [
          "Niacinamide",
          "Centella Asiatica (Rau má)",
          "Salicylic Acid (BHA) nồng độ thấp",
          "Hyaluronic Acid",
        ];
      } else if (isOily && !isSensitive) {
        typeStr = "Da dầu khỏe mạnh (OR - Oily Resistant)";
        descStr =
          "Da bạn có tuyến bã nhờn hoạt động mạnh nhưng lớp sừng bảo vệ rất khỏe. Ít khi bị dị ứng mỹ phẩm, tuy nhiên dễ bị bít tắc lỗ chân lông sinh mụn ẩn nếu không làm sạch kỹ.";
        activeList = [
          "Salicylic Acid (BHA)",
          "Retinol",
          "Clay (Đất sét)",
          "Tea Tree Oil",
        ];
      } else if (!isOily && isSensitive) {
        typeStr = "Da khô nhạy cảm (DS - Dry Sensitive)";
        descStr =
          "Làn da thiếu độ ẩm tự nhiên, bề mặt thô ráp kết hợp phản ứng kích ứng cao. Dễ xuất hiện nếp nhăn li ti và mẩn đỏ dưới tác động môi trường. Cần phục hồi tối đa.";
        activeList = [
          "Ceramides",
          "Panthenol (Vitamin B5)",
          "Glycerin",
          "Squalane",
        ];
      } else {
        typeStr = "Da khô khỏe mạnh (DR - Dry Resistant)";
        descStr =
          "Da thiếu hụt dầu tự nhiên dẫn đến khô căng, nhưng hàng sừng bảo vệ hoạt động tốt, ít nhạy cảm. Phù hợp để cấp ẩm sâu và chống lão hóa sớm.";
        activeList = [
          "Hyaluronic Acid",
          "Retinol chống lão hóa",
          "AHA (Glycolic Acid)",
          "Vitamin E",
        ];
      }

      // Add target actives based on concern
      if (mainConcern === "P") {
        activeList.push("Vitamin C", "Alpha Arbutin");
      } else if (mainConcern === "W") {
        activeList.push("Peptides", "Bakuchiol");
      }

      setSkinProfile({
        type: typeStr,
        desc: descStr,
        actives: Array.from(new Set(activeList)),
      });
      setStep(QUESTIONS.length + 1);
    }
  };

  const handleReset = () => {
    setStep(0);
    setAnswers([]);
  };

  return (
    <div className="surface-glass mx-auto max-w-xl rounded-3xl border border-white/60 p-6 shadow-xl transition-all duration-500 sm:p-8">
      {/* Welcome Step */}
      {step === 0 && (
        <div className="space-y-6 text-center">
          <div className="bg-primary/10 text-primary mx-auto flex h-14 w-14 items-center justify-center rounded-2xl">
            <Sparkles className="h-7 w-7" />
          </div>
          <div className="space-y-2">
            <h3 className="font-heading text-foreground text-2xl font-bold tracking-tight">
              Khảo sát nhanh tình trạng da
            </h3>
            <p className="text-muted-foreground text-sm">
              Chỉ với 3 câu hỏi trắc nghiệm nhanh, khám phá sơ bộ phân loại da
              của bạn theo chuẩn y khoa Baumann và nhận gợi ý hoạt chất chăm
              sóc.
            </p>
          </div>
          <Button
            onClick={handleStart}
            className="group w-full rounded-2xl py-6 text-base font-bold"
          >
            Bắt đầu kiểm tra
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      )}

      {/* Quiz Questions */}
      {step >= 1 && step <= QUESTIONS.length && (
        <div className="space-y-6">
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="text-muted-foreground flex justify-between text-xs font-semibold">
              <span>
                CÂU HỎI {step} / {QUESTIONS.length}
              </span>
              <span>
                {Math.round(((step - 1) / QUESTIONS.length) * 100)}% HOÀN THÀNH
              </span>
            </div>
            <div className="bg-secondary h-2 w-full overflow-hidden rounded-full">
              <div
                className="bg-primary h-full transition-all duration-300"
                style={{ width: `${(step / QUESTIONS.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-heading text-foreground text-lg font-bold">
              {QUESTIONS[step - 1].text}
            </h4>
            <div className="grid gap-3">
              {QUESTIONS[step - 1].options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(opt.key)}
                  className="border-border/70 hover:bg-primary/5 hover:border-primary/40 text-foreground hover:text-primary w-full rounded-2xl border bg-white/50 p-4 text-left text-sm font-medium shadow-sm transition-all duration-200 hover:shadow active:scale-[0.99]"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Result Step */}
      {step > QUESTIONS.length && (
        <div className="animate-in fade-in zoom-in-95 space-y-6 duration-300">
          <div className="border-border/50 flex items-center gap-3 border-b pb-4">
            <CheckCircle2 className="h-7 w-7 flex-shrink-0 text-green-500" />
            <div>
              <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                Kết quả dự đoán của bạn
              </span>
              <h4 className="font-heading text-foreground text-lg font-bold">
                {skinProfile.type}
              </h4>
            </div>
          </div>

          <p className="text-muted-foreground text-sm leading-relaxed">
            {skinProfile.desc}
          </p>

          <div className="space-y-3">
            <h5 className="text-foreground text-xs font-bold tracking-wider uppercase">
              Hoạt chất khuyên dùng cho bạn:
            </h5>
            <div className="flex flex-wrap gap-2">
              {skinProfile.actives.map((active, index) => (
                <span
                  key={index}
                  className="bg-primary/10 text-primary rounded-xl px-3 py-1.5 text-xs font-semibold"
                >
                  {active}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-4 sm:flex-row">
            <Button
              onClick={handleReset}
              variant="outline"
              className="border-border/80 hover:bg-secondary/50 flex-1 rounded-xl font-semibold"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Làm lại
            </Button>
            <a href="/login?redirectTo=/scan" className="flex-[2]">
              <Button className="group w-full rounded-xl font-bold">
                Soi da AI & Nhận quy trình chăm sóc da chi tiết
                <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
