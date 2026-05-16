# api/tasks.py
from __future__ import annotations

from datetime import datetime
from typing import Optional

from bson import ObjectId
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from db.mongo import db

router = APIRouter(tags=["tasks"])

# --------------------------------------------------------------------------
# Season / day calculation
#
# Season boundaries that match master_tasks counts:
#   Winter  (90):  Dec 1 – Feb 28/29
#   Spring  (61):  Mar 1 – Apr 30
#   Summer  (61):  May 1 – Jun 30
#   Monsoon (92):  Jul 1 – Sep 30
#   Autumn  (61):  Oct 1 – Nov 30
# --------------------------------------------------------------------------

def _season_and_day() -> tuple[str, int]:
    now = datetime.now()
    m, d = now.month, now.day

    if m == 12:
        return "Winter", d           # days  1-31
    if m == 1:
        return "Winter", 31 + d      # days 32-62
    if m == 2:
        return "Winter", 62 + d      # days 63-90
    if m == 3:
        return "Spring", d           # days  1-31
    if m == 4:
        return "Spring", 31 + d      # days 32-61
    if m == 5:
        return "Summer", d           # days  1-31
    if m == 6:
        return "Summer", 31 + d      # days 32-61
    if m == 7:
        return "Monsoon", d          # days  1-31
    if m == 8:
        return "Monsoon", 31 + d     # days 32-62
    if m == 9:
        return "Monsoon", 62 + d     # days 63-92
    if m == 10:
        return "Autumn", d           # days  1-31
    # m == 11
    return "Autumn", 31 + d          # days 32-61


# --------------------------------------------------------------------------
# GET /tasks/today
# --------------------------------------------------------------------------

@router.get("/tasks/today")
async def get_today_task(userId: Optional[str] = Query(None)):
    """
    Get today's task for the user based on their personal journey.
    Day 1 = registration date, Day 2 = next day, etc.
    """
    if not userId:
        # Fallback to calendar-based if no userId provided
        season, day_number = _season_and_day()
        print(f"No userId provided, using calendar-based: Season={season}, Day={day_number}")
    else:
        # Get user's registration date
        try:
            user = await db.users.find_one({"_id": ObjectId(userId)})
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
            
            # Get user's created_at date
            user_created = user.get("created_at")
            print(f"User {userId} created_at: {user_created}, type: {type(user_created)}")
            
            if not user_created:
                # Fallback to calendar-based if no created_at
                season, day_number = _season_and_day()
                print(f"No created_at for user, using calendar-based: Season={season}, Day={day_number}")
            else:
                # Calculate days since registration
                now = datetime.now()
                print(f"Current datetime: {now}")
                
                # Ensure user_created is a datetime object
                if isinstance(user_created, str):
                    # Parse ISO format datetime string
                    user_created = datetime.fromisoformat(user_created.replace('Z', '+00:00'))
                    print(f"Parsed string to datetime: {user_created}")
                elif not isinstance(user_created, datetime):
                    # If it's some other type, fallback to calendar-based
                    print(f"Unexpected type for created_at: {type(user_created)}, falling back to calendar-based")
                    season, day_number = _season_and_day()
                    user_created = None
                
                if user_created:
                    # Calculate days difference (Day 1 = registration day)
                    days_since_registration = (now.date() - user_created.date()).days + 1
                    print(f"Days since registration: {days_since_registration}")
                    
                    # Get current season
                    season, _ = _season_and_day()
                    
                    # Get total tasks for current season
                    season_tasks_count = await db.master_tasks.count_documents({"season": season})
                    print(f"Season: {season}, Total tasks: {season_tasks_count}")
                    
                    if season_tasks_count == 0:
                        raise HTTPException(status_code=404, detail=f"No tasks found for season {season}")
                    
                    # Cycle through tasks if user has been registered longer than season duration
                    day_number = ((days_since_registration - 1) % season_tasks_count) + 1
                    print(f"Calculated day_number: {day_number}")
                
        except Exception as e:
            print(f"Error calculating user journey day: {e}")
            import traceback
            traceback.print_exc()
            # Fallback to calendar-based
            season, day_number = _season_and_day()

    print(f"Final result - Season: {season}, Day: {day_number}")
    
    task = await db.master_tasks.find_one({"season": season, "dayNumber": day_number})
    if not task:
        # Fallback: first task of the season if exact day is missing
        task = await db.master_tasks.find_one({"season": season, "isActive": True})
    if not task:
        raise HTTPException(status_code=404, detail="No task found for today")

    task_id = str(task["_id"])
    completed = False

    if userId:
        today_str = datetime.now().strftime("%Y-%m-%d")
        completion = await db.user_task_completions.find_one({
            "userId": userId,
            "taskId": task_id,
            "completedDate": today_str,
        })
        completed = completion is not None

    return {
        "taskId": task_id,
        "season": task["season"],
        "dayNumber": task["dayNumber"],
        "element": task["element"],
        "title": task["title"],
        "description": task.get("description", ""),
        "quote": task.get("quote", ""),
        "cycle": task.get("cycle", ""),
        "completed": completed,
    }


# --------------------------------------------------------------------------
# POST /tasks/complete
# --------------------------------------------------------------------------

class CompleteTaskBody(BaseModel):
    taskId: str
    userId: str


@router.post("/tasks/complete")
async def complete_task(body: CompleteTaskBody):
    today_str = datetime.now().strftime("%Y-%m-%d")

    existing = await db.user_task_completions.find_one({
        "userId": body.userId,
        "taskId": body.taskId,
        "completedDate": today_str,
    })

    if not existing:
        await db.user_task_completions.insert_one({
            "userId": body.userId,
            "taskId": body.taskId,
            "completedDate": today_str,
            "completedAt": datetime.utcnow(),
        })

    return {"success": True, "message": "Task marked as complete"}


# --------------------------------------------------------------------------
# POST /tasks/reset-journey
# --------------------------------------------------------------------------

class ResetJourneyBody(BaseModel):
    userId: str


@router.post("/tasks/reset-journey")
async def reset_journey(body: ResetJourneyBody):
    """
    Reset user's journey to start from today (Day 1).
    Updates the user's created_at to today's date.
    """
    try:
        user = await db.users.find_one({"_id": ObjectId(body.userId)})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Update created_at to today
        now = datetime.now()
        await db.users.update_one(
            {"_id": ObjectId(body.userId)},
            {"$set": {"created_at": now, "journey_reset_at": now, "updated_at": now}}
        )
        
        return {
            "success": True,
            "message": "Journey reset successfully. You will now see Day 1 tasks.",
            "new_start_date": now.isoformat()
        }
    
    except Exception as e:
        print(f"Error resetting journey: {e}")
        raise HTTPException(status_code=500, detail="Failed to reset journey")


# --------------------------------------------------------------------------
# GET /tasks/streak
# --------------------------------------------------------------------------

@router.get("/tasks/streak")
async def get_streak(userId: str = Query(...)):
    """
    Get user's wellness streak information.
    Returns current streak, completed weeks, and weekly progress.
    """
    try:
        # Get user's registration date
        user = await db.users.find_one({"_id": ObjectId(userId)})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        user_created = user.get("created_at")
        if not user_created:
            return {
                "currentStreak": 0,
                "completedWeeks": 0,
                "currentWeek": 1,
                "weeklyProgress": [],
                "thisWeekDays": []
            }
        
        # Ensure user_created is a datetime object
        if isinstance(user_created, str):
            user_created = datetime.fromisoformat(user_created.replace('Z', '+00:00'))
        
        now = datetime.now()
        days_since_registration = (now.date() - user_created.date()).days + 1
        
        # Calculate current week number
        current_week = ((days_since_registration - 1) // 7) + 1
        
        # Get all completed tasks for this user
        completions = await db.user_task_completions.find(
            {"userId": userId}
        ).sort("completedDate", 1).to_list(length=None)
        
        # Create a set of completed dates
        completed_dates = set()
        for comp in completions:
            completed_dates.add(comp["completedDate"])
        
        print(f"User {userId} completed dates: {sorted(completed_dates)}")
        print(f"Today's date: {now.date().strftime('%Y-%m-%d')}")
        
        # Calculate current streak (consecutive days from today backwards)
        from datetime import timedelta
        
        current_streak = 0
        check_date = now.date()
        
        # Start from today and go backwards
        while True:
            date_str = check_date.strftime("%Y-%m-%d")
            print(f"Checking date {date_str}: {'✓' if date_str in completed_dates else '✗'}")
            if date_str in completed_dates:
                current_streak += 1
                check_date = check_date - timedelta(days=1)
            else:
                # If today is not completed, check yesterday
                # This allows the streak to continue if user hasn't completed today yet
                if check_date == now.date() and current_streak == 0:
                    # Today not completed and no streak yet, check yesterday
                    print(f"Today not completed, checking yesterday...")
                    check_date = check_date - timedelta(days=1)
                    continue
                # Break the streak if any other day is missing
                print(f"Streak broken at {date_str}")
                break
        
        print(f"Final streak: {current_streak} days")
        
        # Calculate weekly progress
        from datetime import timedelta
        
        weekly_progress = []
        completed_weeks = 0
        
        for week_num in range(1, current_week + 1):
            week_start_day = (week_num - 1) * 7 + 1
            week_end_day = min(week_num * 7, days_since_registration)
            
            completed_days_in_week = 0
            
            for day_offset in range(week_start_day - 1, week_end_day):
                check_date = user_created.date() + timedelta(days=day_offset)
                date_str = check_date.strftime("%Y-%m-%d")
                if date_str in completed_dates:
                    completed_days_in_week += 1
            
            days_in_week = week_end_day - week_start_day + 1
            is_completed = completed_days_in_week == 7 and days_in_week == 7
            
            if is_completed:
                completed_weeks += 1
            
            weekly_progress.append({
                "week": week_num,
                "completedDays": completed_days_in_week,
                "totalDays": days_in_week,
                "isCompleted": is_completed
            })
        
        # Get this week's daily progress (for the 7-day widget)
        # Use actual calendar week (Monday-Sunday) instead of user's journey week
        from datetime import timedelta
        
        today = now.date()
        # Get Monday of current week (0 = Monday, 6 = Sunday)
        days_since_monday = today.weekday()
        monday_this_week = today - timedelta(days=days_since_monday)
        
        this_week_days = []
        day_labels = ["M", "T", "W", "T", "F", "S", "S"]
        
        for day_offset in range(7):
            check_date = monday_this_week + timedelta(days=day_offset)
            date_str = check_date.strftime("%Y-%m-%d")
            is_today = check_date == today
            is_completed = date_str in completed_dates
            is_future = check_date > today
            
            this_week_days.append({
                "dayLabel": day_labels[day_offset],
                "isCompleted": is_completed,
                "isToday": is_today,
                "isFuture": is_future
            })
        
        return {
            "currentStreak": current_streak,
            "completedWeeks": completed_weeks,
            "currentWeek": current_week,
            "weeklyProgress": weekly_progress,
            "thisWeekDays": this_week_days
        }
    
    except Exception as e:
        print(f"Error calculating streak: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Failed to calculate streak")

