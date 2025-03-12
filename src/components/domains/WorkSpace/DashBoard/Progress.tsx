import { getCard } from "@/lib/apis/workSpace";
import useFilterStore from "@/lib/store/filter";
import useUserDataStore from "@/lib/store/user";
import styles from "@/pages/dashBoard/style.module.scss";
import { useQuery } from "@tanstack/react-query";
import classNames from "classnames/bind";
import dayjs from "dayjs";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const cn = classNames.bind(styles);

export default function Progress() {
  const [allPlan, setAllPlan] = useState<number>(0);
  const [comPlan, setComPlan] = useState<number>(0);
  const [ingPlan, setIngPlan] = useState<number>(0);
  const [prePlan, setPrePlan] = useState<number>(0);
  const [duePlan, setDuePlan] = useState<number>(0);
  const { userData } = useUserDataStore();
  const { filterBox, setFilterBox } = useFilterStore();
  const router = useRouter();

  // 체크리스트 대분류들
  const { data: cardDatas } = useQuery({
    queryKey: ["cardData", userData],
    queryFn: () => getCard(userData.id, "", ""),
  });

  useEffect(() => {
    if (!cardDatas) return;

    const totalPlans = cardDatas.reduce(
      (acc: any, item: any) => acc + item.smallCatItems.length,
      0
    );
    const today = dayjs().startOf("day"); // 오늘 날짜 기준

    const totalPlans2 = cardDatas.reduce((acc: number, item: any) => {
      const pastDueItems = item.smallCatItems.filter((subItem: any) =>
        dayjs(subItem.dueDate).isBefore(today)
      );

      return acc + pastDueItems.length;
    }, 0);

    setAllPlan(totalPlans);
    setDuePlan(totalPlans2);
  }, [cardDatas]);

  // 체크리스트 대분류중 완료된거
  const { data: cardDatasComplete } = useQuery({
    queryKey: ["cardData", "완료", userData],
    queryFn: () => getCard(userData.id, "완료", ""),
  });

  useEffect(() => {
    if (!cardDatasComplete) return;

    const totalPlans = cardDatasComplete.reduce(
      (acc: any, item: any) => acc + item.smallCatItems.length,
      0
    );

    setComPlan(totalPlans);
  }, [cardDatasComplete]);

  // 체크리스트 대분류중 진행중
  const { data: cardDatasIng } = useQuery({
    queryKey: ["cardData", "진행중", userData],
    queryFn: () => getCard(userData.id, "진행중", ""),
  });

  useEffect(() => {
    if (!cardDatasIng) return;

    const totalPlans = cardDatasIng.reduce(
      (acc: any, item: any) => acc + item.smallCatItems.length,
      0
    );

    setIngPlan(totalPlans);
  }, [cardDatasIng]);

  // 체크리스트 대분류중 시작전
  const { data: cardDatasPre } = useQuery({
    queryKey: ["cardData", "시작전", userData],
    queryFn: () => getCard(userData.id, "시작전", ""),
  });

  useEffect(() => {
    if (!cardDatasPre) return;

    const totalPlans = cardDatasPre.reduce(
      (acc: any, item: any) => acc + item.smallCatItems.length,
      0
    );

    setPrePlan(totalPlans);
  }, [cardDatasPre]);

  const handleMoveCheck = (plan: string, dueDate?: string) => {
    setFilterBox({
      category: [],
      progressStatus: plan,
      assignee: [],
      dueDate: dueDate ? dueDate : "",
    });
    router.push("/workSpace");
  };

  useEffect(() => {
    setFilterBox({
      category: [],
      progressStatus: "",
      assignee: [],
      dueDate: "",
    });
  }, []);

  return (
    <div className={cn("progressWrap")}>
      <p>진행 현황</p>
      <div className={cn("progressContents")}>
        <Link href={"/workSpace"}>
          <p>전체 플랜</p>
          <span>{allPlan}개</span>
        </Link>
        <div
          onClick={() => {
            handleMoveCheck("완료");
          }}
        >
          <p>완료한 플랜</p>
          <span>{comPlan}개</span>
        </div>
        <div
          onClick={() => {
            handleMoveCheck("", "-1");
          }}
        >
          <p>마감일 지난 플랜</p>
          <span>{duePlan}개</span>
        </div>
        <div
          onClick={() => {
            handleMoveCheck("진행중");
          }}
        >
          <p>진행중인 플랜</p>
          <span>{ingPlan}개</span>
        </div>
        <div
          onClick={() => {
            handleMoveCheck("시작전");
          }}
        >
          <p>시작전인 플랜</p>
          <span>{prePlan}개</span>
        </div>
      </div>
    </div>
  );
}
