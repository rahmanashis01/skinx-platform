import { CameraOff, Droplet, Sun, Scissors, AlertTriangle } from "lucide-react";

export default function Step0_Rules({ onNext }) {
  const checklistItems = [
    {
      icon: CameraOff,
      label: "Turn off your phone's flash.",
    },
    {
      icon: Droplet,
      label: "Ensure your skin is dry and clean.",
    },
    {
      icon: Sun,
      label: "Move to a room with bright, natural lighting.",
    },
    {
      icon: Scissors,
      label: "If there is dense hair covering the mole, please trim it carefully.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-800 rounded-xl shadow-lg p-8 md:p-12">
        {/* Header */}
        <h1 className="text-4xl md:text-5xl font-bold text-slate-50 mb-8">
          Before we begin
        </h1>

        {/* Checklist */}
        <div className="space-y-6 mb-8">
          {checklistItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div key={index} className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  <IconComponent
                    className="w-6 h-6 text-blue-400"
                    strokeWidth={2}
                  />
                </div>
                <p className="text-slate-300 text-lg leading-relaxed">
                  {item.label}
                </p>
              </div>
            );
          })}
        </div>

        {/* Warning Box */}
        <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-6 mb-10 flex gap-4">
          <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
          <p className="text-red-200 text-base leading-relaxed">
            Do not use this tool on scratched, bleeding, or recently injured moles. Allow the spot to fully heal first to prevent false AI readings.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={onNext}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 text-lg min-h-[56px] shadow-md hover:shadow-lg"
        >
          I Understand & Agree
        </button>
      </div>
    </div>
  );
}
