import { useState, useEffect } from "react";
import type { MouseEvent } from "react";
import axios from "axios";
import "../browse.css";
import ProfileIcon from "../../../assets/icon/ProfileIcon.svg";
import EmptyHeart from "../../../assets/icon/heart_empty.svg";
import FilledHeart from "../../../assets/icon/heart_filled.svg";
import type { CandidateType } from "../../../types/browse";

interface DBItemProps {
  candidate: CandidateType;
  onClick: (candidate: CandidateType) => void;
  userEmail: string;
  liked: boolean;
  onToggleWishlist?: (resumeId: string, isLiked: boolean) => void;
}

const DBItem = ({
  candidate,
  onClick,
  userEmail,
  liked: initialLiked,
  onToggleWishlist,
}: DBItemProps) => {
  const [liked, setLiked] = useState<boolean>(initialLiked);
  const BACK_URL = import.meta.env.VITE_BACKEND_ADDRESS;

  useEffect(() => {
    setLiked(initialLiked); // props로 받은 liked 상태 동기화
  }, [initialLiked]);

  const toggleWishlist = async (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    try {
      if (liked) {
        await axios.delete(
          `${BACK_URL}/resume/wishlist/${userEmail}/${candidate.resume_id}`
        );
        setLiked(false);
        onToggleWishlist?.(candidate.resume_id, false);
      } else {
        await axios.post(
          `${BACK_URL}/resume/wishlist/${userEmail}/${candidate.resume_id}`
        );
        setLiked(true);
        onToggleWishlist?.(candidate.resume_id, true);
      }
    } catch (err) {
      console.error("찜 토글 실패:", err);
    }
  };

  return (
    <div className="db-item" onClick={() => onClick(candidate)}>
      <div className="db-item-profile">
        <img src={ProfileIcon} alt="프로필" />
        <p>
          {candidate.name} ({candidate.age}), {candidate.gender}
        </p>
      </div>
      <div className="db-item-detail">
        <ul>
          {candidate.keyword?.map((keyword, idx) => (
            <li key={idx}># {keyword}</li>
          ))}
        </ul>
      </div>
      <button className="heart-toggle-btn" onClick={toggleWishlist}>
        <img alt="찜하기" src={liked ? FilledHeart : EmptyHeart} />
      </button>
      <p className="wishlist-count-text">{candidate.wishlist?.length || 0}</p>
    </div>
  );
};

export default DBItem;
