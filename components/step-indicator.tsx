interface StepIndicatorProps {
  currentStep: number
  totalSteps: number
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  const steps = ["Template", "Configure", "Generate"]

  return (
    <div className="flex items-center justify-center gap-2 md:gap-4 max-w-md mx-auto">
      {steps.map((step, idx) => {
        const stepNum = idx + 1
        const isActive = stepNum === currentStep
        const isCompleted = stepNum < currentStep

        return (
          <div key={idx} className="flex items-center flex-1">
            {/* Step circle */}
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all ${
                isCompleted
                  ? "bg-accent text-accent-foreground"
                  : isActive
                    ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {isCompleted ? "✓" : stepNum}
            </div>

            {/* Step label */}
            <span
              className={`ml-2 text-sm font-medium hidden sm:inline ${
                isActive ? "text-primary dark:text-blue-400" : isCompleted ? "text-accent" : "text-muted-foreground"
              }`}
            >
              {step}
            </span>

            {/* Connector line */}
            {idx < steps.length - 1 && (
              <div
                className={`flex-1 h-1 mx-2 rounded-full transition-colors ${isCompleted ? "bg-accent" : "bg-border"}`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
