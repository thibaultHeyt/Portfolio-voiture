/** Chemin d'un fichier de `public/` qui suit la base du build.
 *
 *  En local la base vaut `/`, mais un site publié dans un sous-dossier (GitHub
 *  Pages sert `/<dépôt>/`) a besoin du préfixe : sans lui, les modèles et les
 *  aperçus seraient demandés à la racine du domaine et renverraient 404.
 */
export function asset(path: string): string {
  const base = import.meta.env.BASE_URL || '/'
  return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
}
