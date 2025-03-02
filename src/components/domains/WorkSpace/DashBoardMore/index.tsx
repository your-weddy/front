import { postCard } from "@/lib/apis/workSpace";
import { useMutation } from "@tanstack/react-query";
import classNames from "classnames/bind";
import { SubmitHandler, useForm } from "react-hook-form";
import styles from "./style.module.scss";

const cn = classNames.bind(styles);

interface DashBoardProps {
  memberData: any;
  setCardLength: any;
}

interface IFormInput {
  title: string;
}

export default function DashBoardMore({
  memberData,
  setCardLength,
}: DashBoardProps) {
  const { register, handleSubmit } = useForm<IFormInput>();
  const onSubmit: SubmitHandler<IFormInput> = (data) => {
    moreCard(data.title);
  };

  const { mutate: moreCard } = useMutation({
    mutationFn: (data: string) => postCard(memberData.memberId, data),
    onSuccess: () => setCardLength((prev: number) => prev + 1),
  });

  return (
    <div className={cn("dashWrap")}>
      <form onSubmit={handleSubmit(onSubmit)} className={cn("form")}>
        <input type="text" {...register("title")} />
        <button type="submit">만들기</button>
      </form>
    </div>
  );
}
