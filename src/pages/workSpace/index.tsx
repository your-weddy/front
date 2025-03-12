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
  postFile,
  saveProfile,
} from "@/lib/apis/workSpace";

import change from "@/../public/icons/pen.svg";
import MobileFilter from "@/components/commons/Filter/mobileFilter";
import SaveModal from "@/components/modals/SaveModal";
import { getMyData } from "@/lib/apis/authme";
import { getCheckList, postCheckListCreate } from "@/lib/apis/firstVisit";
import { SmallCatItem } from "@/lib/apis/types/types";
import useFilterStore from "@/lib/store/filter";
import useLoginData from "@/lib/store/loginData";
import useColorStore from "@/lib/store/mainColor";
import useReStore from "@/lib/store/reStore";
import useSideMenuStore from "@/lib/store/sideMenu";
import useSideMenuValStore from "@/lib/store/sideMenuValue";
import useUserDataStore from "@/lib/store/user";
import { useWorkSpaceStore } from "@/lib/store/workSpaceData";
import { useMutation, useQuery } from "@tanstack/react-query";
import classNames from "classnames/bind";
import Image from "next/image";
import { useEffect, useState } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import { SubmitHandler, useForm } from "react-hook-form";
import styles from "./style.module.scss";

const cn = classNames.bind(styles);

interface IFormInput {
  newProfile: any;
}

export default function WorkSpace() {
  const [card, setCard] = useState<any>([]);
  const [dDay, setDDay] = useState<boolean>(false);
  const [day, setDay] = useState<string>("");
  const [cardId, setCardId] = useState<number>(0);
  const { reRander, setReRander } = useReStore();
  const { sideMenuState } = useSideMenuStore();
  const { sideMenuValue, setSideMenuValue } = useSideMenuValStore();
  const { data: loginData } = useLoginData();
  const { color } = useColorStore();
  const { selectedItem, setSelectedItem, setChecklistId } = useWorkSpaceStore();
  const [showSaveModal, setShowSaveModal] = useState(false);
  const { filterBox, setFilterBox } = useFilterStore();
  const [profile, setProfile] = useState<string>("");
  const [saveBtn, setSaveBtn] = useState<boolean>(false);
  const { userData, setUserData } = useUserDataStore();

  const assignee = filterBox.assignee && filterBox.assignee.length > 0 
    ? filterBox.assignee[0] : "";
  const now = new Date();

  const { register, handleSubmit, watch } = useForm<IFormInput>();
  const onSubmit: SubmitHandler<IFormInput> = (data) => {
    const dat = {
      profileImageUrl: profile,
    };
    saveProfileImg({ id: loginData.id, dat });
    setSaveBtn(false);
  };

  // 유저 정보
  const { data } = useQuery({
    queryKey: ["getMyData"],
    queryFn: getMyData,
  });
  // 새로운 체크리스트 생성
  const handlePost = () => {
    if (data) {
      const dataBox: any = {
        memberId: data.id,
      };
      mutate(dataBox);
      setReRander((prev: number) => prev + 1);
    }
  };

  // 체크리스트가 있는지 없는지 정보
  const { data: getCheck, isSuccess: checkError } = useQuery({
    queryKey: ["getMyData", data?.id],
    queryFn: () => getCheckList(data?.id),
    enabled: !!data?.id,
  });
  const { mutate } = useMutation({
    mutationFn: (data) => postCheckListCreate(data),
  });
  const { mutate: saveProfileImg } = useMutation({
    mutationFn: ({ id, dat }: { id: any; dat: any }) => saveProfile(id, dat),
  });
  const { mutate: postImgFile } = useMutation({
    mutationFn: (data: any) => postFile(data),
    onSuccess: (data) => {
      setProfile(data?.data);
    },
  });

  // 체크리스트 대분류들
  const { data: cardDatas, isSuccess } = useQuery({
    queryKey: ["cardData", cardId, reRander, ""],
    queryFn: () => getCard(cardId, filterBox.progressStatus, ""),
    enabled: !dDay && cardId !== 0,
  });

  const { data: filteredCardDatas, isLoading, isError } = useQuery({
    queryKey: ["cardData", assignee, userData],
    queryFn: () => getCard(userData.id, "", assignee),
    enabled: !!userData?.id,
  });

  // dday와 체크리스트 정보
  const { data: memberData } = useQuery({
    queryKey: ["memberData", cardId, reRander],
    queryFn: () => getMember(cardId),
    enabled: cardId !== 0,
  });

  // 체크리스트가 없으면 생성
  useEffect(() => {
    if (checkError) {
      handlePost();
      setReRander((prev: number) => prev + 1);
    }
  }, [checkError]);
  useEffect(() => {
    setSaveBtn(false);
  }, []);

  useEffect(() => {
    if (data) {
      setCardId(data.id);
    }
    setUserData(data);
  }, [data, getCheck]);

  useEffect(() => {
    setReRander((prev: number) => prev + 1);
  }, [filterBox.progressStatus]);

  useEffect(() => {
    if (filteredCardDatas) {
      setCard(filteredCardDatas);
    } else {
      setCard([]);
    }
  }, [filteredCardDatas]);

  useEffect(() => {
    setProfile(loginData?.profileImageUrl);
  }, [loginData]);

  useEffect(() => {
    const newProfile = watch("newProfile");

    if (newProfile && newProfile[0]) {
      const formData = new FormData();
      formData.append("file", newProfile[0]); // 실제 파일 객체 추가

      postImgFile(formData); // FormData를 그대로 전송
      setSaveBtn(true);
    }
  }, [watch("newProfile")]);

  const handleOpenModal = (item: SmallCatItem) => {
    setSelectedItem(item);
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
    setReRander((prev: number) => prev + 1);
  };

  const handleShowSaveModal = () => {
    setShowSaveModal(true);
  };

  const handleCloseSaveModal = () => {
    setShowSaveModal(false);
    setReRander((prev: number) => prev + 1);
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
  }, [isSuccess, reRander]);

  useEffect(() => {
    if (memberData && memberData.id) {
      setChecklistId(memberData.id);
    }
  }, [memberData, setChecklistId]);

  const { mutate: moveCard } = useMutation({
    mutationFn: (data) => moveSmallCard(data),
  });

  const onDragEnd = (result: any) => {
    const { destination, source } = result;
    // console.log("이동한곳", destination, "이동전", source);

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
      // setReRander((prev) => prev + 1);
      // 수정 필요
      location.reload();
    },
  });
  const isFilterApplied = () => {
    return (
      (filterBox.category && filterBox.category.length > 0) ||
      !!filterBox.progressStatus ||
      (filterBox.assignee && filterBox.assignee.length > 0) ||
      (filterBox.dueDate !== "" && filterBox.dueDate !== undefined)
    );
  };
  const getFilterDisplayText = () => {
    const filterTexts = [];

    if (filterBox.assignee && filterBox.assignee.length > 0) {
      filterTexts.push(`담당자: ${filterBox.assignee.join(', ')}`);
    }
    return filterTexts.join(', ');
  };
  const handleChangeDday = () => {
    setDDay(false);
    let dayBox: any = { memberId: memberData.memberId, dDay: day };
    postDay(dayBox);
  };
  const isAssigneeFilterApplied = () => {
    return filterBox.assignee && filterBox.assignee.length > 0;
  };

  return (
    <div className={cn("workSide")}>
      <span className={cn("sideMenuBox", { active: sideMenuState })}></span>
      <main className={cn("workSpaceWrap")}>
        <div className={cn("profile")}>
          <div className={cn("profileImg")}>
            <Image src={profile} alt="프로필 사진" width={169} height={169} />
            <form
              onSubmit={handleSubmit(onSubmit)}

              // style={{ display: saveBtn ? "block" : "none" }}
            >
              <input
                type="file"
                id="profileChange"
                accept="image/*"
                {...register("newProfile")}
              />
              {!saveBtn && (
                <label className={cn("profileChange")} htmlFor="profileChange">
                  변경하기
                </label>
              )}
              {saveBtn && (
                <button className={cn("profileChange")} type="submit">
                  저장하기
                </button>
              )}
            </form>
          </div>
          <h2>
            {loginData?.name}님, 소중한 결혼식을 위해
            <br /> 웨디가 함께할게요.
          </h2>
          <div className={cn("dDay")}>
            <p>
              결혼식
              {dDay ? (
                <span onClick={handleChangeDday}>
                  <Image src={change} alt="수정완료" width={20} height={20} />
                  변경
                </span>
              ) : (
                <span onClick={() => setDDay(true)}>
                  <Image src={change} alt="수정하기" width={20} height={20} />
                </span>
              )}
            </p>
            <p className={cn("ddayNum")}>
              D-{" "}
              {dDay ? (
                <>
                  <span>
                    {day
                      ? Math.ceil(
                          (new Date(day).getTime() - now.getTime()) /
                            (1000 * 60 * 60 * 24)
                        )
                      : memberData?.dDay}
                  </span>
                  <input
                    style={{ color: color }}
                    type="date"
                    className={cn("dDayChange")}
                    onChange={(e) => setDay(e.target.value)}
                    id="date"
                  />
                </>
              ) : (
                <span style={{ color: color, cursor: "auto" }}>
                  {memberData?.dDay != null ? memberData?.dDay : "?"}
                </span>
              )}
            </p>
          </div>
        </div>

        <SpaceSearch placeholder={"플랜을 검색해주세요."} />

        <MobileFilter />

        <div className={cn("dashWrap")}>
          <DragDropContext onDragEnd={onDragEnd}>
            {/* item.smallCatItems[i].dueDate - filterBox.dueDate  */}
            {card
              ?.filter((item: any) =>
                filterBox.category.length === 0
                  ? true
                  : filterBox.category.includes(item.title)
              )
              .map((item: any, index: number) => (
                <DashBoard
                  data={item}
                  key={item?.id}
                  num={index}
                  memberData={memberData}
                  setCard={setCard}
                  onOpenModal={handleOpenModal}
                  setReRander={setReRander}
                />
              ))}
            <DashBoardMore memberData={memberData} setReRander={setReRander} />
          </DragDropContext>
        </div>
      </main>

      <SideMenu state={sideMenuState} />

      {selectedItem && (
        <CheckListPage
          onClose={handleCloseModal}
          item={{ ...selectedItem, checklistId: memberData?.id || 0 }}
          ids={{
            checklistId: memberData?.id || 0,
            largeCatItemId: selectedItem?.largeCatItemId || 0,
            smallCatItemId: selectedItem?.id || 0,
          }}
          onDeleteSuccess={handleItemDelete}
          onShowSaveModal={handleShowSaveModal}
        />
      )}

      {showSaveModal && (
        <SaveModal onClose={handleCloseSaveModal} statusName={""} />
      )}

      {isAssigneeFilterApplied() && (
        <div className={cn("filterIndicator")}>
          <div className={cn("activeFilters")}>
            <span>담당자: {filterBox.assignee.join(', ')}</span>
          </div>
          <button 
            onClick={() => setFilterBox({...filterBox, assignee: []})}
            className={cn("clearFiltersBtn")}
          >
            담당자 필터 초기화
          </button>
        </div>
      )}
    </div>
  );
}
