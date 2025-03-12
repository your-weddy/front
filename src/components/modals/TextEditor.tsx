import classNames from "classnames/bind";
import styles from "./style.module.scss";

import fontBold from "@/../public/icons/font-bold.png";
import fontItalic from "@/../public/icons/font-italic.png";
import fontMiddle from "@/../public/icons/font-middleline.png";
import fontUnder from "@/../public/icons/font-underline.png";
import link from "@/../public/icons/link-icon.png";
import picture from "@/../public/icons/picture-icon.png";
import youtube from "@/../public/icons/youtube-icon.png";
import deleteItem from "@/../public/icons/close-modal-icon.svg"

import { deleteFile, postFile } from "@/lib/apis/workSpace";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";

const cn = classNames.bind(styles);

type EditorProps = {
  content: any;
  onContentChange: any;
  onFileUpload?: (fileUrl: string, isNewFile?: boolean) => void;
  item: {
    checklistId: number;
    id: number;
    largeCatItemId: number;
    title: string;
    dueDate: string;
    assigneeName: string;
    body: string;
    statusName: string;
    amount: number;
    attachedFileUrl?: string;
  };
};

const uploadFileToS3 = async (file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await postFile(formData);
    if (!response || !response.data) {
      throw new Error("파일 업로드에 실패했습니다.");
    }
    return response.data;
  } catch (error) {
    console.error("S3 업로드 오류:", error);
    throw error;
  }
};

export default function TextEditor({
  content,
  onContentChange,
  onFileUpload,
  item,
}: EditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [selection, setSelection] = useState<Range | null>(null);
  const [isUpdatingContent, setIsUpdatingContent] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [attachedFileUrl, setAttachedFileUrl] = useState<string | undefined>(
    item.attachedFileUrl
  );
  const [attachedFiles, setAttachedFiles] = useState<{ id: string; url: string }[]>([]);
  const [prevHtml, setPrevHtml] = useState<string>("");

  useEffect(() => {
    if (editorRef.current && !isUpdatingContent) {
      if (editorRef.current.innerHTML !== content) {
        editorRef.current.innerHTML = content;
        setPrevHtml(content);
        applyImageProtection();
      }
    }
  }, [content, isUpdatingContent]);

  useEffect(() => {
    setAttachedFileUrl(item.attachedFileUrl);
  }, [item.attachedFileUrl]);

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.getRangeAt && sel.rangeCount) {
      setSelection(sel.getRangeAt(0));
    }
  };

  const applyImageProtection = () => {
    if (editorRef.current) {
      const images = editorRef.current.querySelectorAll("img");
      images.forEach((img) => {
        img.setAttribute("draggable", "false");

        img.addEventListener("dragstart", preventEvent);
        img.addEventListener("contextmenu", preventEvent);

        const parentContainer = img.closest(".image-attachment");
        if (parentContainer) {
          parentContainer.addEventListener("dragstart", preventEvent);
          parentContainer.addEventListener("contextmenu", preventEvent);
        }

        img.style.userSelect = "none";
        img.style.pointerEvents = "none";
      });
    }
  };

  const restoreSelection = () => {
    if (selection && editorRef.current) {
      editorRef.current.focus();
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(selection);
      }
    } else if (editorRef.current) {
      editorRef.current.focus();
      const range = document.createRange();
      range.selectNodeContents(editorRef.current);
      range.collapse(false);
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
  };

  const preventEvent = (e: Event) => {
    e.preventDefault();
    return false;
  };

  const applyStyle = (command: string, value?: string) => {
    restoreSelection();
    document.execCommand(command, false, value);
    saveSelection();
    handleChange();
  };

  const insertYoutube = () => {
    const youtubeUrl = prompt(
      "유튜브 URL을 입력하세요:",
      "https://www.youtube.com/watch?v="
    );
    if (youtubeUrl) {
      const videoId = youtubeUrl.split("v=")[1]?.split("&")[0];
      if (videoId) {
        editorRef.current?.focus();
        restoreSelection();

        const randomId = Math.random().toString(36).substring(2, 9);
        const youtubeContainerId = `youtube-container-${randomId}`;

        const embedCode = `<div contenteditable="false" id="${youtubeContainerId}" style="position: relative; width: 100%; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 10px 0;">
          <iframe 
            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" 
            src="https://www.youtube.com/embed/${videoId}" 
            frameborder="0" 
            allowfullscreen>
          </iframe>
        </div>&#8203;`;  

        document.execCommand("insertHTML", false, embedCode);

        setTimeout(() => {
          const youtubeContainer = editorRef.current?.querySelector(
            `#${youtubeContainerId}`
          );
          if (youtubeContainer && editorRef.current) {
            const range = document.createRange();
            range.setStartAfter(youtubeContainer);
            range.collapse(true);
  
            const selection = window.getSelection();
            if (selection) {
              selection.removeAllRanges();
              selection.addRange(range);
              editorRef.current.focus();
              handleChange();
            }
          }
        }, 10);
      } else {
        alert("유효한 유튜브 URL이 아닙니다.");
      }
    }
  };

  const insertImage = () => {
    if (imageInputRef.current) {
      imageInputRef.current.click();
    }
  };

  const attachFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const getFileIcon = (fileName: string): string => {
    const extension = fileName.split(".").pop()?.toLowerCase() || "";

    switch (extension) {
      case "pdf":
        return "📕"; // PDF 아이콘
      case "doc":
      case "docx":
        return "📘"; // 워드 문서 아이콘
      case "xls":
      case "xlsx":
        return "📊"; // 엑셀 문서 아이콘
      case "ppt":
      case "pptx":
        return "📙"; // 파워포인트 문서 아이콘
      case "zip":
      case "rar":
        return "🗜️"; // 압축 파일 아이콘
      case "txt":
        return "📄"; // 텍스트 파일 아이콘
      default:
        return "📎"; // 기본 파일 아이콘
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      alert("파일 크기는 10MB를 초과할 수 없습니다.");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    const randomId = Math.random().toString(36).substring(2, 9);
    setLoadingId(randomId);
    setIsUploading(true);

    try {
      const fileUrl = await uploadFileToS3(file);
      const fileContainerId = `file-container-${randomId}`;
      restoreSelection();
      
      const fileName = file.name;
      const fileIcon = getFileIcon(fileName);
      setAttachedFiles(prev => [...prev, { id: randomId, url: fileUrl }]);

      let fileSize = "";
      if (file.size < 1024 * 1024) {
        fileSize = (file.size / 1024).toFixed(2) + " KB";
      } else {
        fileSize = (file.size / (1024 * 1024)).toFixed(2) + " MB";
      }

      const fileHtml = `<div contenteditable="false" id="${fileContainerId}" class="file-attachment" data-file-id="${randomId}" data-file-url="${fileUrl}" style="margin: 10px 0; padding: 10px; border: 1px solid #e0e0e0; border-radius: 4px; background-color: #f8f8f8;">
    <div style="display: flex; justify-content: space-between; align-items: center; position: relative;">
      <div style="display: flex; align-items: center; color: #333;">
        <span style="font-size: 24px; margin-right: 10px;">${fileIcon}</span>
        <div>
          <div style="font-weight: bold;">${fileName}</div>
          <div style="color: #666; font-size: 12px;">${fileSize}</div>
        </div>
      </div>
      <div style="display: flex; gap: 8px;">
        <a href="${fileUrl}" download="${fileName}" style="padding: 5px 10px; background-color: #f0f0f0; border-radius: 4px; text-decoration: none; color: #333; font-size: 12px;">
          다운로드
        </a>
        <button 
          type="button" 
          class="file-delete-btn" 
          data-file-id="${randomId}" 
          data-file-url="${fileUrl}" 
          style="padding: 5px 10px; background-color: #ff5252; border: none; border-radius: 4px; color: white; font-size: 12px; cursor: pointer;">
          삭제
        </button>
      </div>
    </div>
  </div>&#8203;`;

      document.execCommand("insertHTML", false, fileHtml);

      setTimeout(() => {
        const fileContainer = editorRef.current?.querySelector(
          `#${fileContainerId}`
        );
        if (fileContainer && editorRef.current) {
          const range = document.createRange();
          range.setStartAfter(fileContainer);
          range.collapse(true);

          const selection = window.getSelection();
          if (selection) {
            selection.removeAllRanges();
            selection.addRange(range);

            editorRef.current.focus();
            handleChange();
          }
        }
      }, 10);

      setAttachedFileUrl(fileUrl);
      if (onFileUpload) {
        onFileUpload(fileUrl);
      }
    } catch (error) {
      console.error("파일 업로드 오류:", error);
      alert("파일 업로드에 실패했습니다.");
    } finally {
      setIsUploading(false);
      setLoadingId(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    const validImageTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!validImageTypes.includes(file.type)) {
      alert("이미지 파일만 업로드 가능합니다.");
      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
      return;
    }

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      alert("이미지 크기는 10MB를 초과할 수 없습니다.");
      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
      return;
    }

    const randomId = Math.random().toString(36).substring(2, 9);
    setLoadingId(randomId);
    setIsUploading(true);

    try {
      const imageUrl = await uploadFileToS3(file);
      const imgContainerId = `img-container-${randomId}`;
      restoreSelection();
      setAttachedFiles(prev => [...prev, { id: randomId, url: imageUrl }]);

      const imgHtml = `<div contenteditable="false" id="${imgContainerId}" class="image-attachment" data-file-id="${randomId}" data-file-url="${imageUrl}" style="position: relative; margin: 10px 0; text-align: center;" ondragstart="return false;" oncontextmenu="return false;">
      <button 
        type="button" 
        class="img-delete-btn" 
        data-file-id="${randomId}" 
        data-file-url="${imageUrl}" 
        style="position: absolute; top: 5px; right: 5px; width: 25px; height: 25px; border: 2px solid #ccc; border-radius: 50%; font-size: 10px; display: flex; justify-content: center; align-items: center;">
        <img src="/icons/close-modal-icon.svg" alt="파일 삭제" style="width: 15px; height: 15px; color: #ccc;" />
      </button>
      <img src="${imageUrl}" alt="업로드된 이미지" style="max-width: 100%; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); user-select: none; pointer-events: none;" draggable="false" />
    </div>&#8203;`;

      document.execCommand("insertHTML", false, imgHtml);

      setTimeout(() => {
        const imgContainer = editorRef.current?.querySelector(
          `#${imgContainerId}`
        );
        if (imgContainer && editorRef.current) {
          const range = document.createRange();
          range.setStartAfter(imgContainer);
          range.collapse(true);

          const selection = window.getSelection();
          if (selection) {
            selection.removeAllRanges();
            selection.addRange(range);
            editorRef.current.focus();
          }
        }
        handleChange();
        applyImageProtection();
      }, 10);

      setAttachedFileUrl(imageUrl);
      if (onFileUpload && imageUrl) {
        onFileUpload(imageUrl);
      }
    } catch (error) {
      console.error("이미지 업로드 오류:", error);
      alert("이미지 업로드에 실패했습니다.");
    } finally {
      setIsUploading(false);
      setLoadingId(null);
      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
    }
  };

  const deleteFiles = async (id: string, url: string) => {
    try {
      await deleteFile(url);
      setAttachedFiles(prev => prev.filter(file => file.id !== id));
      const remainingFiles = attachedFiles.filter(file => file.id !== id);
      if (remainingFiles.length === 0) {
        setAttachedFileUrl(undefined);
        if (onFileUpload) onFileUpload("", false);
      } else {
        const lastFile = remainingFiles[remainingFiles.length - 1];
        setAttachedFileUrl(lastFile.url);
        if (onFileUpload) onFileUpload(lastFile.url, false);
      }
      handleChange();
    } catch (error) {
      console.error("파일 삭제 오류:", error);
      alert("파일 삭제에 실패했습니다.");
    }
  };
  
  const handleEditorClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    
    if (target.classList.contains('file-delete-btn') || target.classList.contains('img-delete-btn')) {
      e.preventDefault();
      e.stopPropagation();
      
      const id = target.getAttribute('data-file-id');
      const url = target.getAttribute('data-file-url');
      
      if (id && url) {
        const fileElement = document.querySelector(`[data-file-id="${id}"]`);
        if (fileElement) {
          fileElement.remove();
        }
        
        deleteFiles(id, url);
      }
    }
  };

  const handleChange = () => {
    if (editorRef.current) {
      setIsUpdatingContent(true);
      const newContent = editorRef.current.innerHTML;
      setPrevHtml(newContent);
      onContentChange(newContent);
      setTimeout(() => {
        setIsUpdatingContent(false);
      }, 0);
    }
  };

  const handleFocus = () => {
    document.addEventListener("selectionchange", saveSelection);
  };

  const handleBlur = () => {
    document.removeEventListener("selectionchange", saveSelection);
  };

  useEffect(() => {
    return () => {
      document.removeEventListener("selectionchange", saveSelection);
    };
  }, []);

  return (
    <div className={cn("editorWrap")}>
      <div className={cn("editorContents")}>
        <div
          ref={editorRef}
          className={cn("editor", "scroll")}
          contentEditable={true}
          onInput={handleChange}
          onClick={handleEditorClick}
          onFocus={handleFocus}
          onBlur={handleBlur}
          spellCheck="false"
        ></div>
        <div className={cn("editorBtns")}>
          <button type="button" onClick={() => applyStyle("bold")}>
            <Image src={fontBold} alt="폰트 굵게" width={25} height={25} />
          </button>
          <button type="button" onClick={() => applyStyle("italic")}>
            <Image src={fontItalic} alt="폰트 기울기" width={25} height={25} />
          </button>
          <button type="button" onClick={() => applyStyle("strikeThrough")}>
            <Image src={fontMiddle} alt="폰트 중간줄" width={25} height={25} />
          </button>
          <button type="button" onClick={() => applyStyle("underline")}>
            <Image src={fontUnder} alt="폰트 밑줄" width={25} height={25} />
          </button>
          <button type="button" onClick={insertYoutube}>
            <Image src={youtube} alt="유튜브 링크" width={25} height={25} />
          </button>
          <button type="button" onClick={attachFile} disabled={isUploading}>
            <Image src={link} alt="파일 첨부" width={25} height={25} />
          </button>
          <button type="button" onClick={insertImage} disabled={isUploading}>
            <Image src={picture} alt="사진 첨부" width={25} height={25} />
          </button>
        </div>

        {isUploading && (
          <div className={cn("uploadingIndicator")}>
            파일 업로드 중... 잠시만 기다려주세요.
          </div>
        )}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: "none" }}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.txt"
        />

        <input
          type="file"
          ref={imageInputRef}
          onChange={handleImageChange}
          style={{ display: "none" }}
          accept="image/*"
        />
      </div>
    </div>
  );
}
