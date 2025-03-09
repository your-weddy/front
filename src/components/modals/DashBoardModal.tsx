import { LargeCatItem } from "@/lib/apis/types/types";
import styles from "@/pages/dashBoard/style.module.scss";
import classNames from "classnames/bind";
import Image, { StaticImageData } from "next/image";
import { useEffect } from "react";

import closeIcon from "@/../public/icons/close-modal-icon.svg";
import hanbokIcon from "@/../public/icons/progress-hanbok-icon.svg";
import ringIcon from "@/../public/icons/progress-ring-icon.png";
import airplaneIcon from "@/../public/images/Airplane_Gif.gif";
import calenderIcon from "@/../public/images/Calendar.gif";
import congratulationIcon from "@/../public/images/Congratulations.gif";
import defaultIcon2 from "@/../public/images/Heart_Gif.gif";
import lipstickIcon from "@/../public/images/Lipstick.gif";
import weddingIcon from "@/../public/images/Wedding Arch.gif";
import houseIcon from "@/../public/icons/progress-house.png";

const cn = classNames.bind(styles);

interface DashBoarModalProps {
  data: LargeCatItem;
  isOpen: boolean;
  onClose: () => void;
}

interface IconConfig {
  src: StaticImageData;
  scale?: number;
  xOffset?: number;
  yOffset?: number;
}

export default function DashBoardModal({
  data,
  isOpen,
  onClose,
}: DashBoarModalProps) {
  const icons: Record<string, IconConfig> = {
    "결혼 준비 시작": { src: calenderIcon, scale: 3.5, yOffset: 140, xOffset: -20 },
    웨딩홀: { src: weddingIcon, scale: 2.5, yOffset: 10, xOffset: -10 },
    스드메: { src: lipstickIcon, scale: 3, yOffset: 20, xOffset: -10 },
    신혼여행: { src: airplaneIcon, scale: 2 },
    "예물/예단": { src: ringIcon, scale: 1 },
    "예복/한복": { src: hanbokIcon, scale: 1 },
    본식:  { src: congratulationIcon, scale: 3, yOffset: 60, xOffset: -10 },
    신혼집: { src: houseIcon, scale: 1 },
  };

  const defaultIcon: IconConfig = { src: defaultIcon2, scale: 1.3, yOffset: -10 };

  const getCategoryIcon = (categoryTitle: string): IconConfig => {
    return icons[categoryTitle] || defaultIcon;
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscKey);
    }
    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sortedSmallCatItems = data.smallCatItems
    ? [...data.smallCatItems].sort((a, b) => (b.amount || 0) - (a.amount || 0))
    : [];

  const icon = getCategoryIcon(data.title);

  const imageStyle: React.CSSProperties = {
    transform: `scale(${icon.scale || 1})`,
    transformOrigin: 'center',
    margin: '0 auto',
    position: 'relative',
    left: `${icon.xOffset || 0}px`,
    top: `${icon.yOffset || 0}px`,
    objectFit: 'contain',
  };

  return (
    <div className={cn("dashBoardModalWrap")} onClick={handleBackdropClick}>
      <div className={cn("dashBoardModalContents")}>
        <div className={cn("modalGNB")}>
          <p>{data.title}</p>
          <button
            type="button"
            className={cn("modalCloseBtn")}
            onClick={onClose}
          >
            <Image
              src={closeIcon}
              alt={`data.title || "Category icon" + 닫기`}
              width={26}
              height={26}
            />
          </button>
        </div>
        <div className={cn("modalGNBImg")}>
          <Image
            src={icon.src}
            alt={data.title || "Category icon"}
            width={480}
            height={240}
            style={imageStyle}
          />
        </div>
        <ul className={cn("dashBoardModalUl")}>
          {sortedSmallCatItems.map((item, index) => (
            <li key={item.id}>
              <p>{String(index + 1).padStart(2, "0")}</p>
              <span>{item.title}</span>
              <span className={cn("modalAmount")}>
                {(item.amount || 0).toLocaleString()} 원
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
