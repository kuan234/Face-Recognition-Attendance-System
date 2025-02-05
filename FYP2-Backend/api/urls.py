from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from . import views

urlpatterns = [
    path('get/', views.getData),
    path('add/', views.add_employee),
    path('login/', views.login_view),
    path('verify_face/', views.verify_face),
    path('log/', views.get_attendance_by_date),
    path('monthly_log/', views.get_attendance_by_month),
    path('admin_log/', views.get_all_attendance_by_date),
    path('admin_monthly_log/', views.get_all_attendance_by_month),
    path('detect_face/', views.detect_face),
    path('changePassword/', views.changePassword),
    path('forgot_password/', views.forgot_password),
    path('update_face_image/', views.update_face_image),
    path('update_times/', views.update_times),
    path('get_times/', views.get_times),
    path('get_user_role/<int:user_id>/', views.get_user_role),
    path('get_check_in_status/<int:user_id>/', views.get_check_in_status),
    path('delete_user/<int:user_id>/', views.delete_user),
    path('get_check_in_out_counts/', views.get_check_in_out_counts),
]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

    # path('detect_face/', views.detect_face),
# urlpatterns = [
#     path('search/', views.searchProducts),
#     path('upload/', views.uploadImage),
# ] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) 
 