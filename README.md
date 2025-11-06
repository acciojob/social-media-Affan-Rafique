# Social Media App

#### Create a social media app where in certain authors can Create, Read and Edit an post.

**The App should contain following pages and functionalities:**

- The landing page should contain 4 tabs and posts as shown in image. 
  <a target="_blank" href='https://storage.googleapis.com/acciojob-open-file-collections/landing_page.png'>(Landing Page)</a>

- Users tab should contain names of users. Upon clicking on a user, the page should display posts made by the author.
  <a target="_blank" href='https://storage.googleapis.com/acciojob-open-file-collections/users.png'>(Users Page)</a>, 
  <a target="_blank" href='https://storage.googleapis.com/acciojob-open-file-collections/posts_user.png'>(User Posts)</a>
  
- In notifications page, clicking on 'Refresh Notifications' should display notifications.
  <a target="_blank" href='https://storage.googleapis.com/acciojob-open-file-collections/notifications.png'>(Notifiations Page)</a>

- User must be able to create post.
  <a target="_blank" href='https://storage.googleapis.com/acciojob-open-file-collections/create_post.png'>(Create Post)</a>, 
  <a target="_blank" href='https://storage.googleapis.com/acciojob-open-file-collections/create_post_1.png'>(Select User/Author)</a>, 
  <a target="_blank" href='https://storage.googleapis.com/acciojob-open-file-collections/post_Added.png'>(Post added)</a>
  
- User must be able to react to a post.
  <a target="_blank" href='https://storage.googleapis.com/acciojob-open-file-collections/add_reactions.png'>(Add Reactions)</a>

- User must be able to edit post.
  <a target="_blank" href='https://storage.googleapis.com/acciojob-open-file-collections/click_edit.png'>(Click Edit)</a>, 
  <a target="_blank" href='https://storage.googleapis.com/acciojob-open-file-collections/edit_post.png'>(Edit Post)</a>, 
  <a target="_blank" href='https://storage.googleapis.com/acciojob-open-file-collections/post_edited.png'>(Post Edited)</a>


**Use following selectors:**

##### Create post section:

- `#postAuthor` to select an author.
- `#postContent` for content text area.

##### Posts section:

- `.posts-list` for posts container.

##### Edit post section:

- After clicking on 'View Post' of a post, the post must be displayed in new page. And post must contain class name `post`
- Edit button should contain class name `button`
- Post Title must contain id `postTitle`
- Post Content must contain id `postContent`

##### Refresh Notifications:
- 'Refresh Notifications' should have a class name `button`  
