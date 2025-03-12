import Amount from "@/components/domains/WorkSpace/DashBoard/Amount";
import Progress from "@/components/domains/WorkSpace/DashBoard/Progress";
import SideMenu from "@/components/domains/WorkSpace/SideMenu";
import DashBoardModal from "@/components/modals/DashBoardModal";
import { getCard, getMember } from "@/lib/apis/workSpace";
import useSideMenuStore from "@/lib/store/sideMenu";
import { useWorkSpaceStore } from "@/lib/store/workSpaceData";
import { useQuery } from "@tanstack/react-query";
import classNames from "classnames/bind";
import Image from "next/image";
import { useEffect, useState } from "react";
import styles from "./style.module.scss";

import { getMyData } from "@/lib/apis/authme";
import { getCheckList } from "@/lib/apis/firstVisit";
import useReStore from "@/lib/store/reStore";
import AssigneeFilter from "@/components/commons/Filter/assigneeFilter";
import useUserDataStore from "@/lib/store/user";

const cn = classNames.bind(styles);

export default function DashBoard() {
  const [amount, setAmount] = useState<any>([]);
  const [cardId, setCardId] = useState<number>(0);
  const { reRander, setReRander } = useReStore();
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const { setSelectLargeItem, setChecklistId } = useWorkSpaceStore();
  const { sideMenuState } = useSideMenuStore();
  const { userData, setUserData } = useUserDataStore();

  const { data: cardDatas, isSuccess } = useQuery({
    queryKey: ["cardData", cardId, reRander],
    queryFn: () => getCard(cardId, "", ""),
  });
  const { data: memberData } = useQuery({
    queryKey: ["memberData", cardId, reRander],
    queryFn: () => getMember(cardId),
    enabled: cardId !== 0,
  });
  const { data } = useQuery({
    queryKey: ["getMyData"],
    queryFn: getMyData,
  });
  const { data: getCheck, isSuccess: checkError } = useQuery({
    queryKey: ["getMyData", data?.id],
    queryFn: () => getCheckList(data?.id),
    enabled: !!data?.id,
  });
  useEffect(() => {
    if (data) {
      setCardId(data.id);
      setUserData(data);
    }
  }, [data, getCheck, setUserData]);

  const handleOpenModal = (item: any) => {
    if (cardDatas && cardDatas.length > 0) {
      const fullItemData = cardDatas.find(
        (cardItem: any) => cardItem.id === item.id
      );

      if (fullItemData) {
        setSelectedItem(fullItemData);
        setShowModal(true);
      } else {
        setSelectedItem(item);
        setShowModal(true);
      }
    } else {
      setSelectedItem(item);
      setShowModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectLargeItem(null);
    setSelectedItem(null);
  };

  useEffect(() => {
    if (memberData && memberData.id) {
      setChecklistId(memberData.id);
    }
  }, [memberData, setChecklistId]);

  useEffect(() => {
    setAmount(cardDatas);
  }, [isSuccess]);

  useEffect(() => {
    if (memberData && memberData.id) {
      setChecklistId(memberData.id);
    }
  }, [memberData, setChecklistId]);

  useEffect(() => {
  }, [showModal, selectedItem]);

  useEffect(() => {
    setAmount(cardDatas);
  }, [isSuccess]);

  return (
    <div className={cn("workSide")}>
      <span className={cn("sideMenuBox", { active: sideMenuState })}></span>

      <main className={cn("dashBoardMain")}>
        <div className={cn("dashBoardWrap")}>
          <Progress />
          {amount && amount.length > 0 && (
            <Amount
              data={amount}
              setAmount={setAmount}
              onOpenModal={handleOpenModal}
            />
          )}
          <AssigneeFilter />
        </div>
      </main>
      <SideMenu state={sideMenuState} />
      {showModal && selectedItem && (
        <DashBoardModal
          isOpen={showModal}
          onClose={handleCloseModal}
          data={selectedItem}
        />
      )}
    </div>
  );
}
