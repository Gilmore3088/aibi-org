"""Environment-driven settings."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    supabase_url: str
    supabase_service_key: str
    anthropic_api_key: str

    # Digest (filled in for the day-13 milestone)
    digest_to_email: str | None = None
    resend_api_key: str | None = None


settings = Settings()  # type: ignore[call-arg]
