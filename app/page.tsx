"use client";

import { MainContent } from "@/components/MainContent.client";
import { MainState, MainStateAction } from "@/types/MainTypes";
import { getInitialState, mainStateReducer } from "@/utils/mainStateUtils";
import { useImmerReducer } from "use-immer";

export default function Home() {
  const [mainState, mainStateDispatch] = useImmerReducer<
    MainState,
    MainStateAction
  >(mainStateReducer, getInitialState());

  return (
    <main>
      <MainContent
        mainState={mainState}
        mainStateDispatch={mainStateDispatch}
      />
    </main>
  );
}
