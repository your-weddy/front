import profileImg from "@/../public/images/testImg.jpg";
import DashBoard from "@/components/domains/WorkSpace/DashBoard";
import DashBoardMore from "@/components/domains/WorkSpace/DashBoardMore";
import SideMenu from "@/components/domains/WorkSpace/SideMenu";
import SpaceSearch from "@/components/domains/WorkSpace/SpaceSearch";
import CheckListPage from "@/components/modals/CheckListPage";
import {
  getCard,
  getMember,
  moveSmallCard,
  postDday,
} from "@/lib/apis/workSpace";

import MobileFilter from "@/components/commons/Filter/mobileFilter";
import SaveModal from "@/components/modals/SaveModal";
import { getCheckList, postCheckListCreate } from "@/lib/apis/firstVisit";
import { SmallCatItem } from "@/lib/apis/types/types";
import useFilterStore from "@/lib/store/filter";
import useLoginData from "@/lib/store/loginData";
import useColorStore from "@/lib/store/mainColor";
import useSideMenuStore from "@/lib/store/sideMenu";
import useSideMenuValStore from "@/lib/store/sideMenuValue";
import { useWorkSpaceStore } from "@/lib/store/workSpaceData";
import { useMutation, useQuery } from "@tanstack/react-query";
import classNames from "classnames/bind";
import Image from "next/image";
import { useEffect, useState } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import styles from "./style.module.scss";

const cn = classNames.bind(styles);

export default function WorkSpace() {
  const [card, setCard] = useState<any>([]);
  const [dDay, setDDay] = useState<boolean>(false);
  const [day, setDay] = useState<string>("");
  const [cardId, setCardId] = useState<number>(1);
  const [cardLength, setCardLength] = useState<number>(0);
  const { sideMenuState } = useSideMenuStore();
  const { sideMenuValue, setSideMenuValue } = useSideMenuValStore();
  const { data: loginData } = useLoginData();
  const { color } = useColorStore();
  const { checklistId, selectedItem, setSelectedItem } = useWorkSpaceStore();
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [currentStatusName, setCurrentStatusName] = useState<string>("");
  const { filterBox } = useFilterStore();

  const { data: cardDatas, isSuccess } = useQuery({
    queryKey: ["cardData", cardId, cardLength],
    queryFn: () => getCard(cardId, filterBox.progressStatus),
    enabled: !dDay,
  });
  useEffect(() => {
    setCardLength((prev) => prev + 1);
  }, [filterBox.progressStatus]);
  const { data: memberData } = useQuery({
    queryKey: ["memberData", cardId],
    queryFn: () => getMember(cardId),
  });
  const handlePost = () => {
    if (memberData) {
      const dataBox: any = {
        memberId: memberData.memberId,
      };
      mutate(dataBox);
    }
  };
  const { data: getCheck, isSuccess: checkSuccess } = useQuery({
    queryKey: ["getMyData", memberData],
    queryFn: () => getCheckList(memberData.id),
  });
  const { mutate } = useMutation({
    mutationFn: (data) => postCheckListCreate(data),
  });
  console.log(cardDatas);
  useEffect(() => {
    if (getCheck?.status === 200 && cardDatas?.length === 0) {
      handlePost();
    }
  }, [getCheck]);

  const handleOpenModal = (item: SmallCatItem) => {
    setSelectedItem(item);
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
  };

  const handleShowSaveModal = (statusName: string) => {
    if (statusName === "완료") {
      setCurrentStatusName(statusName);
      setShowSaveModal(true);
    } else {
      setCardLength((prev) => prev + 1);
    }
  };

  const handleCloseSaveModal = () => {
    setShowSaveModal(false);
    if (currentStatusName === "완료") {
      setCardLength((prev) => prev + 1);
    }
  };

  const handleItemDelete = () => {
    setCard((prev: any) => {
      return prev.map((cardItem: any) => ({
        ...cardItem,
        smallCatItems: cardItem.smallCatItems.filter(
          (item: any) => item.id !== selectedItem?.id
        ),
      }));
    });

    setSideMenuValue((prev: any) => {
      return prev.map((item: any) => ({
        ...item,
        smallCatItems: item.smallCatItems.filter(
          (smallItem: any) => smallItem.id !== selectedItem?.id
        ),
      }));
    });
  };

  useEffect(() => {
    setCard(cardDatas);
    setSideMenuValue(cardDatas);
  }, [isSuccess]);

  const { mutate: moveCard } = useMutation({
    mutationFn: (data) => moveSmallCard(data),
  });

  const onDragEnd = (result: any) => {
    const { destination, source } = result;
    console.log("이동한곳", destination, "이동전", source);

    if (!destination) return; // 드롭이 완료되지 않으면 아무것도 하지 않음

    const dragCardList = card.map((c: any) => ({
      ...c,
      smallCatItems: [...c.smallCatItems], // 내부 배열도 복사 (불변성 유지)
    }));

    // 올바른 index 찾기
    const sourceIndex = dragCardList.findIndex(
      (c: { id: number }) => c.id === Number(source.droppableId)
    );
    const destinationIndex = dragCardList.findIndex(
      (c: { id: number }) => c.id === Number(destination.droppableId)
    );

    if (sourceIndex === -1 || destinationIndex === -1) return; // 존재하지 않는 경우 리턴

    // smallCatItems 이동
    const [removedCard] = dragCardList[sourceIndex].smallCatItems.splice(
      source.index,
      1
    );
    dragCardList[destinationIndex].smallCatItems.splice(
      destination.index,
      0,
      removedCard
    );

    // 필터링된 리스트
    const filteredList = dragCardList.filter(
      (item: any) => item.id === Number(destination.droppableId)
    );

    if (!filteredList.length) return;

    // postMoveCard 생성
    let postMoveCard: any = {
      checklistId: filteredList[0]?.checklistId,
      largeCatItemId: filteredList[0]?.id,
      smallCatItemIds: filteredList[0]?.smallCatItems.map(
        (item: any) => item.id
      ),
    };

    setCard(dragCardList);
    moveCard(postMoveCard);
  };
  const { mutate: postDay } = useMutation({
    mutationFn: (data) => postDday(data),
    onSuccess: (data) => {
      console.log(data);
      // setCardLength((prev) => prev + 1);
      // 수정 필요
      location.reload();
    },
  });

  const handleChangeDday = () => {
    setDDay(false);
    let dayBox: any = { memberId: memberData.memberId, dDay: day };
    postDay(dayBox);
  };
  return (
    <div className={cn("workSide")}>
      <span className={cn("sideMenuBox", { active: sideMenuState })}></span>
      <main className={cn("workSpaceWrap")}>
        <div className={cn("profile")}>
          <Image
            src={
              loginData?.profileImageUrl !== null
                ? loginData?.profileImageUrl
                : profileImg
            }
            alt="프로필 사진"
            width={169}
            height={169}
          />
          <h2>
            {loginData?.name}님, 소중한 결혼식을 위해
            <br /> 웨디가 함께할께요.
          </h2>
          <div className={cn("dDay")}>
            <p>결혼식 </p>
            <p className={cn("ddayNum")}>
              D -{" "}
              {dDay ? (
                <input
                  style={{ color: color }}
                  type="date"
                  className={cn("dDayChange")}
                  onChange={(e) => setDay(e.target.value)}
                />
              ) : (
                <span style={{ color: color, cursor: "auto" }}>
                  {memberData?.dDay != null ? memberData?.dDay : "?"}
                </span>
              )}
            </p>
            <div className={cn("change")}>
              {dDay ? (
                <span onClick={handleChangeDday}>✏️변경하기</span>
              ) : (
                <span onClick={() => setDDay(true)}>✏️수정</span>
              )}
            </div>
          </div>
        </div>

        <SpaceSearch placeholder={"플랜을 검색해주세요."} />

        <MobileFilter />

        <div className={cn("dashWrap")}>
          <DragDropContext onDragEnd={onDragEnd}>
            {card
              ?.filter((item: any) =>
                filterBox.category.length === 0
                  ? true
                  : filterBox.category.includes(item.title)
              )
              .map((item: any, index: number) => (
                <DashBoard
                  data={item}
                  key={item.id}
                  num={index}
                  memberData={memberData}
                  setCard={setCard}
                  onOpenModal={handleOpenModal}
                />
              ))}
            <DashBoardMore
              memberData={memberData}
              setCardLength={setCardLength}
            />
          </DragDropContext>
        </div>
      </main>

      <SideMenu state={sideMenuState} />

      {selectedItem && (
        <CheckListPage
          onClose={handleCloseModal}
          item={{ ...selectedItem, checklistId }}
          ids={{
            checklistId: checklistId || 0,
            largeCatItemId: selectedItem?.largeCatItemId || 0,
            smallCatItemId: selectedItem?.id || 0,
          }}
          onDeleteSuccess={handleItemDelete}
          onShowSaveModal={handleShowSaveModal}
        />
      )}

      {showSaveModal && (
        <SaveModal 
          onClose={handleCloseSaveModal} 
          statusName={currentStatusName}
        />
      )}
    </div>
  );
}
