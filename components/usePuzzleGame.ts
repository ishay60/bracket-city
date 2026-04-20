"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import type { Puzzle, PuzzleNode } from "@/lib/puzzle";
import {
  applyGuess,
  applyPeek,
  applyReveal,
  createGameState,
  findNode,
  getSolvableLeaves,
  isPuzzleComplete,
} from "@/lib/puzzle";
import type { GameState } from "@/lib/puzzle";

interface InternalState {
  game: GameState;
  input: string;
  shakeNodeId: string | null;
  popNodeId: string | null;
  tick: number;
}

type Action =
  | { type: "setActive"; nodeId: string | null }
  | { type: "appendChar"; ch: string }
  | { type: "backspace" }
  | { type: "clear" }
  | { type: "submit"; puzzle: Puzzle }
  | { type: "peek"; puzzle: Puzzle }
  | { type: "reveal"; puzzle: Puzzle }
  | { type: "clearPop" }
  | { type: "clearShake" };

function cloneGame(g: GameState): GameState {
  return {
    ...g,
    solved: new Set(g.solved),
    peeks: new Set(g.peeks),
    reveals: new Set(g.reveals),
    solveOrder: [...g.solveOrder],
  };
}

function reducer(state: InternalState, action: Action): InternalState {
  switch (action.type) {
    case "setActive": {
      if (state.game.activeNodeId === action.nodeId) return state;
      return {
        ...state,
        game: { ...state.game, activeNodeId: action.nodeId },
        input: "",
      };
    }
    case "appendChar": {
      if (!state.game.activeNodeId) return state;
      return {
        ...state,
        input: state.input + action.ch,
        game: { ...state.game, keystrokes: state.game.keystrokes + 1 },
      };
    }
    case "backspace": {
      if (!state.input) return state;
      return { ...state, input: state.input.slice(0, -1) };
    }
    case "clear":
      return { ...state, input: "" };
    case "submit": {
      const nodeId = state.game.activeNodeId;
      if (!nodeId || !state.input.trim()) return state;
      const nextGame = cloneGame(state.game);
      const res = applyGuess(action.puzzle, nextGame, nodeId, state.input);
      if (res.ok) {
        return {
          ...state,
          game: nextGame,
          input: "",
          popNodeId: res.solvedNodeId,
          shakeNodeId: null,
          tick: state.tick + 1,
        };
      }
      if (res.reason === "wrong") {
        return {
          ...state,
          game: nextGame,
          input: "",
          shakeNodeId: nodeId,
          popNodeId: null,
          tick: state.tick + 1,
        };
      }
      return state;
    }
    case "peek": {
      const nodeId = state.game.activeNodeId;
      if (!nodeId) return state;
      const nextGame = cloneGame(state.game);
      if (!applyPeek(action.puzzle, nextGame, nodeId)) return state;
      return { ...state, game: nextGame, tick: state.tick + 1 };
    }
    case "reveal": {
      const nodeId = state.game.activeNodeId;
      if (!nodeId) return state;
      const nextGame = cloneGame(state.game);
      const res = applyReveal(action.puzzle, nextGame, nodeId);
      if (!res.ok) return state;
      return {
        ...state,
        game: nextGame,
        input: "",
        popNodeId: res.solvedNodeId,
        tick: state.tick + 1,
      };
    }
    case "clearPop":
      return { ...state, popNodeId: null };
    case "clearShake":
      return { ...state, shakeNodeId: null };
  }
}

export function usePuzzleGame(puzzle: Puzzle) {
  const [state, dispatch] = useReducer(
    reducer,
    undefined,
    (): InternalState => ({
      game: createGameState(puzzle),
      input: "",
      shakeNodeId: null,
      popNodeId: null,
      tick: 0,
    }),
  );

  const stateRef = useRef(state);
  stateRef.current = state;

  const activeNode = state.game.activeNodeId
    ? findNode(puzzle.tree, state.game.activeNodeId)
    : null;

  const solvableLeaves = useMemo(
    () => getSolvableLeaves(puzzle.tree, state.game.solved),
    [puzzle.tree, state.game.solved, state.tick],
  );

  const complete = useMemo(
    () => isPuzzleComplete(puzzle.tree, state.game.solved),
    [puzzle.tree, state.game.solved, state.tick],
  );

  const setActive = useCallback((nodeId: string | null) => {
    dispatch({ type: "setActive", nodeId });
  }, []);

  const submit = useCallback(() => {
    dispatch({ type: "submit", puzzle });
  }, [puzzle]);

  const peek = useCallback(() => dispatch({ type: "peek", puzzle }), [puzzle]);
  const reveal = useCallback(() => dispatch({ type: "reveal", puzzle }), [puzzle]);

  useEffect(() => {
    if (!state.popNodeId) return;
    const t = setTimeout(() => dispatch({ type: "clearPop" }), 420);
    return () => clearTimeout(t);
  }, [state.popNodeId]);

  useEffect(() => {
    if (!state.shakeNodeId) return;
    const t = setTimeout(() => dispatch({ type: "clearShake" }), 320);
    return () => clearTimeout(t);
  }, [state.shakeNodeId]);

  // Auto-advance active if it was cleared by a solve and there's a new leaf
  useEffect(() => {
    if (complete) return;
    if (state.game.activeNodeId) {
      const n = findNode(puzzle.tree, state.game.activeNodeId);
      if (!n || state.game.solved.has(state.game.activeNodeId)) {
        dispatch({ type: "setActive", nodeId: solvableLeaves[0]?.id ?? null });
      }
      return;
    }
    if (solvableLeaves[0]) {
      dispatch({ type: "setActive", nodeId: solvableLeaves[0].id });
    }
  }, [solvableLeaves, state.game.activeNodeId, state.game.solved, puzzle.tree, complete]);

  // Global keystroke capture — the plan says "just start typing"
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (complete) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;

      if (e.key === "Enter") {
        e.preventDefault();
        submit();
        return;
      }
      if (e.key === "Backspace") {
        e.preventDefault();
        dispatch({ type: "backspace" });
        return;
      }
      if (e.key === "Escape") {
        dispatch({ type: "clear" });
        return;
      }
      if (e.key === "Tab") {
        e.preventDefault();
        const leaves = getSolvableLeaves(puzzle.tree, stateRef.current.game.solved);
        const idx = leaves.findIndex((n) => n.id === stateRef.current.game.activeNodeId);
        const next = leaves[(idx + (e.shiftKey ? -1 : 1) + leaves.length) % leaves.length];
        if (next) dispatch({ type: "setActive", nodeId: next.id });
        return;
      }
      if (e.key.length === 1 && !e.repeat) {
        // accept any printable char (Hebrew, Latin, digits, space, punctuation)
        if (/[\s\u0590-\u05FFa-zA-Z0-9'"\u05F3\u05F4\-]/.test(e.key)) {
          dispatch({ type: "appendChar", ch: e.key });
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [submit, puzzle.tree, complete]);

  return {
    game: state.game,
    input: state.input,
    activeNode,
    solvableLeaves,
    popNodeId: state.popNodeId,
    shakeNodeId: state.shakeNodeId,
    complete,
    setActive,
    submit,
    peek,
    reveal,
    tick: state.tick,
  } as const;
}

export type UsePuzzleGame = ReturnType<typeof usePuzzleGame>;
export type { PuzzleNode };
