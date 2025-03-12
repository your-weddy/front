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

  const { data: assigneeData } = useQuery({
    queryKey: ["cardData", userData?.id],
    queryFn: () => {
      if (!userData?.id) return [];
      return getCard(userData.id, "", "");
    },
    enabled: !!userData?.id,
  });
  
  useEffect(() => {
    if (!assigneeData) return;
    let groomCount = 0;
    assigneeData.forEach((item: any) => {
      if (item.smallCatItems && Array.isArray(item.smallCatItems)) {
        const groomItems = item.smallCatItems.filter(
          (item: any) => item.assigneeName === "신랑"
        );
        groomCount += groomItems.length;
      }
    });
    setGroomCount(groomCount);

    let brideCount = 0;
    assigneeData.forEach((item: any) => {
      if (item.smallCatItems && Array.isArray(item.smallCatItems)) {
        const brideItems = item.smallCatItems.filter(
          (item: any) => item.assigneeName === "신부"
        );
        brideCount += brideItems.length;
      }
    });
    setBrideCount(brideCount);
  }, [assigneeData]);

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