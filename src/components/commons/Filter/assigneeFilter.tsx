import useFilterStore from "@/lib/store/filter";
import { useRouter } from "next/router";
import classNames from "classnames/bind";
import Image from "next/image";
import styles from "@/pages/dashBoard/style.module.scss";
import { useEffect, useState } from "react";
import useUserDataStore from "@/lib/store/user";
import { useQuery } from "@tanstack/react-query";
import { getCard } from "@/lib/apis/workSpace";

import bride from "@/../public/images/dashBoard-bride.png";
import groom from "@/../public/images/dashBoard-groom.png";

const cn = classNames.bind(styles);

export default function AssigneeFilter() {
  const [groomCount, setGroomCount] = useState<number>(0);
  const [brideCount, setBrideCount] = useState<number>(0);
  const router = useRouter();
  const { filterBox, setFilterBox } = useFilterStore();
  const { userData } = useUserDataStore();

  const { data: groomDatas } = useQuery({
    queryKey: ["cardData", "신랑", userData?.id],
    queryFn: () => getCard(userData.id, "", "신랑"),
    enabled: !!userData?.id,
  });
  const { data: brideDatas } = useQuery({
    queryKey: ["cardData", "신부", userData?.id],
    queryFn: () => getCard(userData.id, "", "신부"),
    enabled: !!userData?.id,
  });
  
  useEffect(() => {
    if (!groomDatas) return;
    const totalGroomPlans = groomDatas.reduce(
      (acc: any, item: any) => acc + (item.smallCatItems?.length || 0),
      0
    );
    setGroomCount(totalGroomPlans);
  }, [groomDatas]);

  useEffect(() => {
    if (!brideDatas) return;
    const totalBridePlans = brideDatas.reduce(
      (acc: any, item: any) => acc + (item.smallCatItems?.length || 0),
      0
    );
    setBrideCount(totalBridePlans);
  }, [brideDatas]);

  const handleAssigneeFilter = (assignee: string) => {
    setFilterBox({
      category: [],
      progressStatus: "",
      assignee: [assignee],
      dueDate: "",
    });
    router.push('/workSpace');
  };

  return (
    <div className={cn("assigneeNameWrap")}>
      <p>담당자</p>
      <div className={cn("assigneeNameContent")}>
        <div 
          onClick={() => handleAssigneeFilter("신랑")}
          className={cn("assigneeItem")}
        >
          <Image
            src={groom}
            alt="담당자 신랑인 리스트"
            width={193}
            height={230}
          />
          <p>{groomCount}개</p>
        </div>
        <div 
          onClick={() => handleAssigneeFilter("신부")}
          className={cn("assigneeItem")}
        >
          <Image
            src={bride}
            alt="담당자 신부인 리스트"
            width={193}
            height={230}
          />
          <p>{brideCount}개</p>
        </div>
      </div>
    </div>
  );
}