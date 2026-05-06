const profileFields =
  "id,name,username,account_type,followers_count,follows_count,media_count,profile_picture_url,biography,website";

const authScope = "instagram_business_basic,instagram_business_manage_insights";

const instagramConnect = {
  profileFields,
  authScope,
};

export default instagramConnect;
