import styles from "@/pages/dashBoard/style.module.scss";
import classNames from "classnames/bind";
import Image, { StaticImageData } from "next/image";

import airplaneIcon from "@/../public/icons/progress-airplane.svg";
import calenderIcon from "@/../public/icons/progress-calender.svg";
import congratulationIcon from "@/../public/icons/progress-congratulations.svg";
import defaultIcon2 from "@/../public/icons/progress-default-Icon.svg";
import hanbokIcon from "@/../public/icons/progress-hanbok-icon.svg";
import houseIcon from "@/../public/icons/progress-house.png";
import lipstickIcon from "@/../public/icons/progress-lipstick.svg";
import ringIcon from "@/../public/icons/progress-ring-icon.png";
import weddingIcon from "@/../public/icons/progress-wedding.svg";
import { LargeCatItem } from "@/lib/apis/types/types";

const cn = classNames.bind(styles);

interface SmallCatItem {
  checklistId: number;
  id: number;
  largeCatItemId: number;
  title: string;
  dueDate: string;
  assigneeName: string;
  statusName: string;
  amount: number;
  body: string;
  attachedFileUrl: string;
}

interface largeCatItem {
  id: number;
  checklistId: number;
  title: string;
  smallCatItems: SmallCatItem[];
}

interface AmountProps {
  data: largeCatItem[];
  setAmount: any;
  onOpenModal?: (item: any) => void;
}

const formatKoreanNumber = (num: number): string => {
  if (num === 0) return "0";

  const units = ["", "만", "억", "조"];
  let result = "";
  let unitIndex = 0;

  while (num > 0) {
    const chunk = num % 10000;
    if (chunk > 0) {
      const formattedChunk = chunk.toLocaleString();
      result =
        formattedChunk +
        (units[unitIndex] ? "" + units[unitIndex] + " " : "") +
        result;
    }
    num = Math.floor(num / 10000);
    unitIndex++;
  }
  return result.trim();
};

const largeCatNumber = (num: number): string => {
  return num.toLocaleString();
};

export default function Amount({ data, setAmount, onOpenModal }: AmountProps) {
  const icons: Record<string, StaticImageData> = {
    "결혼 준비 시작": calenderIcon,
    웨딩홀: weddingIcon,
    스드메: lipstickIcon,
    신혼여행: airplaneIcon,
    "예물/예단": ringIcon,
    "예복/한복": hanbokIcon,
    본식: congratulationIcon,
    신혼집: houseIcon,
  };

  const defaultIcon: StaticImageData = defaultIcon2;
  const getCategoryIcon = (categoryTitle: string): StaticImageData => {
    return icons[categoryTitle] || defaultIcon;
  };
  const handleItemClick = (item: largeCatItem) => {
    if (onOpenModal) {
      onOpenModal({
        ...item,
        smallCatItems: item.smallCatItems.map((catItem) => {
          return catItem;
        }),
      });
    }
  };
  const calculateTotalAmount = (): number => {
    return data.reduce((total, category) => {
      const categoryTotal = category.smallCatItems.reduce(
        (sum, item) => sum + (item.amount || 0),
        0
      );
      return total + categoryTotal;
    }, 0);
  };
  const calculateCategoryAmount = (category: LargeCatItem): number => {
    return category.smallCatItems.reduce(
      (sum, item) => sum + (item.amount || 0),
      0
    );
  };
  const totalAmount = calculateTotalAmount();

  return (
    <div className={cn("amountWrap")}>
      <p>결혼 예산</p>
      <div className={cn("amountContents")}>
        <p>총 {formatKoreanNumber(totalAmount)}원</p>
        <ul className={cn("amountUl")}>
          {data.map((category, index) => (
            <li key={category.id} onClick={() => handleItemClick(category)}>
              <Image
                src={getCategoryIcon(category.title)}
                alt={category.title}
                width={50}
                height={50}
              />
              <div>
                <p>{category.title}</p>
                <span>
                  {largeCatNumber(calculateCategoryAmount(category))}원
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
