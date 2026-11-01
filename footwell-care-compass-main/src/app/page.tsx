import { HomePage } from "@/routes/index";
import { ArticleCard } from "@/components/journal/ArticleCard";
import { visibleArticles } from "@/server/journal/articles";

export default function Page() {
  return <HomePage journalCards={visibleArticles().slice(0, 3).map(article => <ArticleCard key={article.slug} article={article} />)} />;
}
