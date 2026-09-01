import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { FaGraduationCap } from "react-icons/fa";

const PracticeButton = () => {
  const t = useTranslations("home.header");
  const router = useRouter();
  const locale = useLocale();

  return (
    <button
      className="flex items-center text-slate-200 hover:text-slate-300"
      onClick={() => router.push(`/${locale}/practice`)}
    >
      <FaGraduationCap className="mr-2" />
      <span>{t("practice")}</span>
    </button>
  );
};

export default PracticeButton;
