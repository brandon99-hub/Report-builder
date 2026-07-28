import { useState, useCallback, useRef, useEffect } from "react"

export function useUndoRedo<T>(initialState: T) {
  const [history, setHistory] = useState<T[]>([initialState])
  const [currentIndex, setCurrentIndex] = useState(0)
  const currentIndexRef = useRef(0)

  // Keep ref in sync with state
  useEffect(() => {
    currentIndexRef.current = currentIndex
  }, [currentIndex])

  const current = history[currentIndex]
  const canUndo = currentIndex > 0
  const canRedo = currentIndex < history.length - 1

  const setState = useCallback(
    (newState: T | ((prevState: T) => T)) => {
      setHistory((prevHistory) => {
        const prevIndex = currentIndexRef.current
        const currentState = prevHistory[prevIndex]
        // Support both direct state and functional updates
        const updatedState = typeof newState === 'function' 
          ? (newState as (prevState: T) => T)(currentState)
          : newState
        
        // Remove any future history if we're not at the end
        const newHistory = prevHistory.slice(0, prevIndex + 1)
        newHistory.push(updatedState)
        
        // Update index to point to the new state
        setCurrentIndex(newHistory.length - 1)
        
        return newHistory
      })
    },
    [] // No dependencies needed since we use ref
  )

  const undo = useCallback(() => {
    if (canUndo) {
      setCurrentIndex(currentIndex - 1)
    }
  }, [canUndo, currentIndex])

  const redo = useCallback(() => {
    if (canRedo) {
      setCurrentIndex(currentIndex + 1)
    }
  }, [canRedo, currentIndex])

  const reset = useCallback((newState: T) => {
    setHistory([newState])
    setCurrentIndex(0)
  }, [])

  return {
    state: current,
    setState,
    undo,
    redo,
    canUndo,
    canRedo,
    reset,
  }
}
