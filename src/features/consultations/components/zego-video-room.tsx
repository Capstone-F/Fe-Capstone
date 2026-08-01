"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, RefreshCw, Video } from "lucide-react";
import type { ZegoUIKitPrebuilt as ZegoRoom } from "@zegocloud/zego-uikit-prebuilt";

import { Button } from "@/shared/components/ui/button";
import { consultationApi } from "../api/consultation.api";

interface ZegoVideoRoomProps {
  bookingId: string;
}

export function ZegoVideoRoom({ bookingId }: ZegoVideoRoomProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [attempt, setAttempt] = useState(0);
  const [started, setStarted] = useState(false);
  const [state, setState] = useState<"idle" | "loading" | "joined" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!started || !containerRef.current) return;

    let disposed = false;
    let room: ZegoRoom | null = null;

    async function join() {
      setState("loading");
      setError(null);

      try {
        const [{ data }, { ZegoUIKitPrebuilt }] = await Promise.all([
          consultationApi.getVideoToken(bookingId),
          import("@zegocloud/zego-uikit-prebuilt"),
        ]);
        if (disposed || !containerRef.current) return;

        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForProduction(
          data.appID,
          data.token,
          data.roomID,
          data.userID,
          data.userName,
        );
        room = ZegoUIKitPrebuilt.create(kitToken);
        room.joinRoom({
          container: containerRef.current,
          scenario: { mode: ZegoUIKitPrebuilt.OneONoneCall },
          showPreJoinView: true,
          showRoomTimer: true,
          showTextChat: true,
          showUserList: false,
          showScreenSharingButton: false,
          turnOnCameraWhenJoining: true,
          turnOnMicrophoneWhenJoining: true,
          onJoinRoom: () => setState("joined"),
          onLeaveRoom: () => {
            setState("idle");
            setStarted(false);
          },
        });
      } catch (reason) {
        if (disposed) return;
        setError(
          reason instanceof Error
            ? reason.message
            : "Không thể khởi tạo phòng video.",
        );
        setState("error");
      }
    }

    void join();

    return () => {
      disposed = true;
      room?.destroy();
    };
  }, [attempt, bookingId, started]);

  if (!started) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center gap-4 bg-slate-950 px-6 text-center text-white">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-500/20">
          <Video className="h-7 w-7 text-indigo-300" />
        </div>
        <div>
          <h2 className="text-base font-semibold">Phòng tư vấn trực tuyến</h2>
          <p className="mt-1 text-sm text-slate-400">
            Camera và micro sẽ được kiểm tra trước khi vào phòng.
          </p>
        </div>
        <Button
          onClick={() => setStarted(true)}
          className="bg-indigo-600 text-white hover:bg-indigo-500"
        >
          <Video className="mr-2 h-4 w-4" />
          Mở phòng video
        </Button>
      </div>
    );
  }

  return (
    <div className="relative min-h-[420px] overflow-hidden bg-slate-950">
      <div ref={containerRef} className="h-[min(72vh,720px)] min-h-[420px]" />
      {state === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950 text-sm text-white">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Đang lấy quyền truy cập phòng...
        </div>
      )}
      {state === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950 px-6 text-center text-white">
          <p className="max-w-md text-sm text-red-300">{error}</p>
          <Button
            variant="outline"
            onClick={() => setAttempt((value) => value + 1)}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Thử lại
          </Button>
        </div>
      )}
    </div>
  );
}
