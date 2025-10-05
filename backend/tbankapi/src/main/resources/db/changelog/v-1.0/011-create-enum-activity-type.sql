--changeset nikguscode:create-enum-activity-type

CREATE TYPE ACTIVITY_TYPE AS ENUM (
    'GAME_PC',
    'GAME_BOARD',
    'VR_AR',
    'MASTERCLASS',
    'QUIZ_QUEST',
    'PHOTO_ZONE'
);